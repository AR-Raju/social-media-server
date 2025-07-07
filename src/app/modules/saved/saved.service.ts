import httpStatus from "http-status"
import QueryBuilder from "../../builder/QueryBuilder"
import AppError from "../../errors/AppError"
import { Event } from "../event/event.model"
import { Post } from "../post/post.model"
import { TradingListing } from "../trading/trading.model"
import { SavedItem } from "./saved.model"

const saveItemIntoDB = async (userId: string, itemType: string, itemId: string) => {
  // Convert itemType from plural to singular
  const singularItemType = itemType.replace(/s$/, "")

  // Validate item type
  if (!["post", "event", "listing"].includes(singularItemType)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid item type")
  }

  // Check if item exists
  let item
  switch (singularItemType) {
    case "post":
      item = await Post.findById(itemId)
      break
    case "event":
      item = await Event.findById(itemId)
      break
    case "listing":
      item = await TradingListing.findById(itemId)
      break
  }

  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, `${singularItemType} not found`)
  }

  // Check if already saved
  const existingSavedItem = await SavedItem.findOne({
    user: userId,
    itemType: singularItemType,
    itemId,
  })

  if (existingSavedItem) {
    throw new AppError(httpStatus.BAD_REQUEST, `${singularItemType} is already saved`)
  }

  // Save the item
  const savedItem = await SavedItem.create({
    user: userId,
    itemType: singularItemType,
    itemId,
  })

  return { message: `${singularItemType} saved successfully`, savedItem }
}

const unsaveItemFromDB = async (userId: string, itemType: string, itemId: string) => {
  // Convert itemType from plural to singular
  const singularItemType = itemType.replace(/s$/, "")

  const savedItem = await SavedItem.findOne({
    user: userId,
    itemType: singularItemType,
    itemId,
  })

  if (!savedItem) {
    throw new AppError(httpStatus.NOT_FOUND, `Saved ${singularItemType} not found`)
  }

  await SavedItem.findByIdAndDelete(savedItem._id)

  return { message: `${singularItemType} unsaved successfully` }
}

const getSavedPostsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const savedQuery = new QueryBuilder(
    SavedItem.find({ user: userId, itemType: "post" })
      .populate({
        path: "itemId",
        model: "Post",
        populate: {
          path: "author",
          select: "name avatar",
        },
      })
      .sort({ savedAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await savedQuery.modelQuery
  const meta = await savedQuery.countTotal()

  // Transform the result to match the expected format
  const transformedResult = result
    .filter((item: any) => item.itemId)
    .map((item: any) => ({
      _id: item.itemId._id,
      author: item.itemId.author,
      content: item.itemId.content,
      images: item.itemId.images,
      type: item.itemId.type,
      createdAt: item.itemId.createdAt,
      savedAt: item.savedAt,
    }))

  return {
    meta,
    result: transformedResult,
  }
}

const getSavedEventsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const savedQuery = new QueryBuilder(
    SavedItem.find({ user: userId, itemType: "event" })
      .populate({
        path: "itemId",
        model: "Event",
        populate: {
          path: "organizer",
          select: "name avatar",
        },
      })
      .sort({ savedAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await savedQuery.modelQuery
  const meta = await savedQuery.countTotal()

  // Transform the result to match the expected format
  const transformedResult = result
    .filter((item: any) => item.itemId)
    .map((item: any) => ({
      _id: item.itemId._id,
      title: item.itemId.title,
      description: item.itemId.description,
      date: item.itemId.date,
      time: item.itemId.time,
      location: item.itemId.location,
      category: item.itemId.category,
      organizer: item.itemId.organizer,
      price: item.itemId.price,
      images: item.itemId.images,
      createdAt: item.itemId.createdAt,
      savedAt: item.savedAt,
    }))

  return {
    meta,
    result: transformedResult,
  }
}

const getSavedListingsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const savedQuery = new QueryBuilder(
    SavedItem.find({ user: userId, itemType: "listing" })
      .populate({
        path: "itemId",
        model: "TradingListing",
        populate: {
          path: "seller",
          select: "name avatar",
        },
      })
      .sort({ savedAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await savedQuery.modelQuery
  const meta = await savedQuery.countTotal()

  // Transform the result to match the expected format
  const transformedResult = result
    .filter((item: any) => item.itemId)
    .map((item: any) => ({
      _id: item.itemId._id,
      title: item.itemId.title,
      description: item.itemId.description,
      price: item.itemId.price,
      category: item.itemId.category,
      condition: item.itemId.condition,
      images: item.itemId.images,
      seller: item.itemId.seller,
      location: item.itemId.location,
      status: item.itemId.status,
      createdAt: item.itemId.createdAt,
      savedAt: item.savedAt,
    }))

  return {
    meta,
    result: transformedResult,
  }
}

const getAllSavedItemsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const savedQuery = new QueryBuilder(
    SavedItem.find({ user: userId })
      .populate({
        path: "itemId",
        populate: {
          path: "author organizer seller",
          select: "name avatar",
        },
      })
      .sort({ savedAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await savedQuery.modelQuery
  const meta = await savedQuery.countTotal()

  // Transform and categorize results
  const transformedResult = result
    .filter((item: any) => item.itemId)
    .map((item: any) => ({
      _id: item._id,
      itemType: item.itemType,
      savedAt: item.savedAt,
      item: {
        _id: item.itemId._id,
        ...(item.itemType === "post" && {
          author: item.itemId.author,
          content: item.itemId.content,
          images: item.itemId.images,
          type: item.itemId.type,
        }),
        ...(item.itemType === "event" && {
          title: item.itemId.title,
          description: item.itemId.description,
          date: item.itemId.date,
          time: item.itemId.time,
          location: item.itemId.location,
          category: item.itemId.category,
          organizer: item.itemId.organizer,
          price: item.itemId.price,
          images: item.itemId.images,
        }),
        ...(item.itemType === "listing" && {
          title: item.itemId.title,
          description: item.itemId.description,
          price: item.itemId.price,
          category: item.itemId.category,
          condition: item.itemId.condition,
          images: item.itemId.images,
          seller: item.itemId.seller,
          location: item.itemId.location,
          status: item.itemId.status,
        }),
        createdAt: item.itemId.createdAt,
      },
    }))

  return {
    meta,
    result: transformedResult,
  }
}

const checkIfItemIsSavedFromDB = async (userId: string, itemType: string, itemId: string) => {
  const singularItemType = itemType.replace(/s$/, "")

  const savedItem = await SavedItem.findOne({
    user: userId,
    itemType: singularItemType,
    itemId,
  })

  return { isSaved: !!savedItem }
}

export const SavedServices = {
  saveItemIntoDB,
  unsaveItemFromDB,
  getSavedPostsFromDB,
  getSavedEventsFromDB,
  getSavedListingsFromDB,
  getAllSavedItemsFromDB,
  checkIfItemIsSavedFromDB,
}
