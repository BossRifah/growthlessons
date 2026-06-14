import type { CollectionConfig } from "payload";

// Admin/editor accounts. `useAPIKey` lets the daily auto-writer authenticate
// to the REST API with a generated key instead of an email/password session.
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    useAPIKey: true,
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name"],
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
};
