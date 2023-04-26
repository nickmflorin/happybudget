import { user } from "lib/model";

export const MockUser: user.User = {
  first_name: "Nick",
  last_name: "Florin",
  id: 1,
  full_name: "Nick Florin",
  email: "nickmflorin@gmail.com",
  profile_image: null,
  is_first_time: false,
  last_login: "2020-01-01",
  date_joined: "2020-01-01",
  is_active: true,
  is_superuser: true,
  timezone: "",
  address: "",
  position: "",
  company: "",
  phone_number: 1924,
  product_id: "standard",
  billing_status: "active",
  is_staff: true,
  metrics: {
    num_archived_budgets: 1,
    num_budgets: 1,
    num_collaborating_budgets: 1,
    num_templates: 1,
  },
};
