export interface TouristRegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: "TOURIST" | "GUIDE" | "ADMIN"; // optional, defaults to TOURIST
  contactNumber: string;
  category: string[];    // e.g., ["Food", "History"]
  languages: string[];   // e.g., ["English", "Bangla"]
  gender: "MALE" | "FEMALE";
}
