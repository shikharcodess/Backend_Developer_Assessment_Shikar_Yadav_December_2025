import { User } from "../generated/prisma/client";

export interface RequestMetadata {
  userData?: User;
}
