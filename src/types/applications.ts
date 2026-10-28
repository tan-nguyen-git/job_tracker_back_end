export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  category: string;
  dateApplied: string;
  status: "Applied" | "Interview" | "Rejected" | "Offer";
  jobUrl: string;
}
