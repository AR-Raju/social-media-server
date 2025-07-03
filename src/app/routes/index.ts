import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CommentRoutes } from "../modules/comment/comment.route";
import { FriendRoutes } from "../modules/friend/friend.route";
import { GroupRoutes } from "../modules/group/group.route";
import { MessageRoutes } from "../modules/message/message.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { PostRoutes } from "../modules/post/post.route";
import { ProfileRoutes } from "../modules/profile/profile.route";
import { ReactionRoutes } from "../modules/reaction/reaction.route";
import { UploadRoutes } from "../modules/upload/upload.route";
import { UserRoutes } from "../modules/user/user.route";
import { SocketRoutes } from "./socket.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/posts",
    route: PostRoutes,
  },
  {
    path: "/comments",
    route: CommentRoutes,
  },
  {
    path: "/reactions",
    route: ReactionRoutes,
  },
  {
    path: "/friends",
    route: FriendRoutes,
  },
  {
    path: "/groups",
    route: GroupRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/messages",
    route: MessageRoutes,
  },
  {
    path: "/socket",
    route: SocketRoutes,
  },
  {
    path: "/profile",
    route: ProfileRoutes,
  },

  {
    path: "/upload",
    route: UploadRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
