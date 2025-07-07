import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { Notification } from "../notification/notification.model";
import { User } from "../user/user.model";
import type { TTradingListing } from "./trading.interface";
import { TradingContact, TradingListing } from "./trading.model";

const TradingSearchableFields = ["title", "description", "location", "tags"];

const createListingIntoDB = async (
  userId: string,
  listingData: TTradingListing
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const listing = await TradingListing.create({
    ...listingData,
    seller: userId,
  });

  const populatedListing = await TradingListing.findById(listing._id).populate(
    "seller",
    "name avatar"
  );

  return populatedListing;
};

const getAllListingsFromDB = async (query: Record<string, unknown>) => {
  // Filter for active listings by default
  const baseFilter = { isActive: true, status: "active" };

  const listingQuery = new QueryBuilder(
    TradingListing.find(baseFilter).populate("seller", "name avatar"),
    query
  )
    .search(TradingSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await listingQuery.modelQuery;
  const meta = await listingQuery.countTotal();

  // Add computed fields for each listing
  const listingsWithComputedFields = result.map((listing: any) => {
    const listingObj = listing.toObject();
    return {
      ...listingObj,
      likes: listingObj.likes.length,
      isLiked: false, // This would be computed based on current user
      seller: {
        ...listingObj.seller,
        rating: 4.5, // This would come from a ratings system
        totalSales: 25, // This would be computed from completed sales
      },
    };
  });

  return {
    meta,
    result: listingsWithComputedFields,
  };
};

const getSingleListingFromDB = async (userId: string, listingId: string) => {
  const listing = await TradingListing.findById(listingId).populate(
    "seller",
    "name avatar"
  );

  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Increment view count if not the seller viewing their own listing
  if (listing.seller._id.toString() !== userId) {
    await TradingListing.findByIdAndUpdate(listingId, { $inc: { views: 1 } });
  }

  // Check if user has liked this listing
  const isLiked = listing.likes.includes(userId);

  const listingObj = listing.toObject();
  return {
    ...listingObj,
    likes: listingObj.likes.length,
    isLiked,
    seller: {
      ...listingObj,
      rating: 4.5, // This would come from a ratings system
      totalSales: 25, // This would be computed from completed sales
    },
  };
};

const updateListingIntoDB = async (
  userId: string,
  listingId: string,
  payload: Partial<TTradingListing>
) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Check if user is the seller
  if (listing.seller.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own listings"
    );
  }

  const updatedListing = await TradingListing.findByIdAndUpdate(
    listingId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  ).populate("seller", "name avatar");

  return updatedListing;
};

const deleteListingFromDB = async (userId: string, listingId: string) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Check if user is the seller
  if (listing.seller.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own listings"
    );
  }

  // Soft delete by setting isActive to false
  await TradingListing.findByIdAndUpdate(listingId, { isActive: false });

  return listing;
};

const contactSellerIntoDB = async (
  userId: string,
  listingId: string,
  message: string
) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  if (!listing.isActive || listing.status !== "active") {
    throw new AppError(httpStatus.BAD_REQUEST, "Listing is not available");
  }

  // Check if user is trying to contact themselves
  if (listing.seller.toString() === userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot contact yourself");
  }

  // Create contact record
  const contact = await TradingContact.create({
    listing: listingId,
    buyer: userId,
    seller: listing.seller,
    message,
  });

  // Create notification for seller
  const buyer = await User.findById(userId);
  await Notification.create({
    recipient: listing.seller,
    sender: userId,
    type: "message",
    title: "New Listing Inquiry",
    message: `${buyer?.name} is interested in your listing: ${listing.title}`,
    data: { listingId, contactId: contact._id },
  });

  return { message: "Contact request sent successfully" };
};

const markListingAsSoldIntoDB = async (userId: string, listingId: string) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Check if user is the seller
  if (listing.seller.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only mark your own listings as sold"
    );
  }

  if (listing.status === "sold") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Listing is already marked as sold"
    );
  }

  await TradingListing.findByIdAndUpdate(listingId, { status: "sold" });

  return { message: "Listing marked as sold successfully" };
};

const toggleListingLikeIntoDB = async (userId: string, listingId: string) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  const isLiked = listing.likes.includes(userId);

  if (isLiked) {
    // Unlike
    await TradingListing.findByIdAndUpdate(listingId, {
      $pull: { likes: userId },
    });
    return { message: "Listing unliked successfully", isLiked: false };
  } else {
    // Like
    await TradingListing.findByIdAndUpdate(listingId, {
      $push: { likes: userId },
    });

    // Create notification for seller if not liking own listing
    if (listing.seller.toString() !== userId) {
      const user = await User.findById(userId);
      await Notification.create({
        recipient: listing.seller,
        sender: userId,
        type: "post_reaction",
        title: "Listing Liked",
        message: `${user?.name} liked your listing: ${listing.title}`,
        data: { listingId },
      });
    }

    return { message: "Listing liked successfully", isLiked: true };
  }
};

const getMyListingsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const listingQuery = new QueryBuilder(
    TradingListing.find({ seller: userId, isActive: true }).populate(
      "seller",
      "name avatar"
    ),
    query
  )
    .search(TradingSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await listingQuery.modelQuery;
  const meta = await listingQuery.countTotal();

  // Add computed fields
  const listingsWithComputedFields = result.map((listing: any) => {
    const listingObj = listing.toObject();
    return {
      ...listingObj,
      likes: listingObj.likes.length,
      isLiked: listingObj.likes.includes(userId),
      seller: {
        ...listingObj.seller,
        rating: 4.5,
        totalSales: 25,
      },
    };
  });

  return {
    meta,
    result: listingsWithComputedFields,
  };
};

const getListingsByLocationFromDB = async (
  location: string,
  query: Record<string, unknown>
) => {
  const listingQuery = new QueryBuilder(
    TradingListing.find({
      location: { $regex: location, $options: "i" },
      isActive: true,
      status: "active",
    }).populate("seller", "name avatar"),
    query
  )
    .search(TradingSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await listingQuery.modelQuery;
  const meta = await listingQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getListingContactsFromDB = async (
  userId: string,
  listingId: string,
  query: Record<string, unknown>
) => {
  const listing = await TradingListing.findById(listingId);
  if (!listing) {
    throw new AppError(httpStatus.NOT_FOUND, "Listing not found");
  }

  // Check if user is the seller
  if (listing.seller.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only view contacts for your own listings"
    );
  }

  const contactQuery = new QueryBuilder(
    TradingContact.find({ listing: listingId })
      .populate("buyer", "name avatar")
      .sort({ contactedAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await contactQuery.modelQuery;
  const meta = await contactQuery.countTotal();

  return {
    meta,
    result,
  };
};

export const TradingServices = {
  createListingIntoDB,
  getAllListingsFromDB,
  getSingleListingFromDB,
  updateListingIntoDB,
  deleteListingFromDB,
  contactSellerIntoDB,
  markListingAsSoldIntoDB,
  toggleListingLikeIntoDB,
  getMyListingsFromDB,
  getListingsByLocationFromDB,
  getListingContactsFromDB,
};
