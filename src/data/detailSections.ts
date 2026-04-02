export interface DetailSection {
  id: string;
  icon: string;
  label: string;
  description?: string;
  hasWarning?: boolean;
}

export const DETAIL_SECTIONS: DetailSection[] = [
  {
    id: "personal-info",
    icon: "person",
    label: "Personal Information",
  },
  {
    id: "emergency-contact",
    icon: "warning",
    label: "Emergency Contact",
  },
  {
    id: "certifications",
    icon: "certificate",
    label: "Certifications",
  },
  {
    id: "time-off",
    icon: "time_off_work",
    label: "Time Off Balance",
  },
  {
    id: "additional-info",
    icon: "person_account",
    label: "Additional Info",
  },
  {
    id: "history",
    icon: "history",
    label: "History",
  },
  {
    id: "w2",
    icon: "document",
    label: "W2",
  },
  {
    id: "pay-type",
    icon: "monetarization",
    label: "Pay Type",
    hasWarning: true,
  },
  {
    id: "tax-withholdings",
    icon: "file_table",
    label: "Tax Withholdings W4",
    hasWarning: true,
  },
  {
    id: "hire-date",
    icon: "calendar",
    label: "Hire date",
  },
  {
    id: "bank-info",
    icon: "payment_instant",
    label: "Bank Info for Direct Deposit",
  },
  {
    id: "documents-pdf",
    icon: "file_type_pdf",
    label: "Documents PDF",
  },
  {
    id: "labor-type",
    icon: "people_group",
    label: "Labor Type",
  },
  {
    id: "skills",
    icon: "people_couple",
    label: "Skills",
  },
  {
    id: "timecard",
    icon: "clock",
    label: "Timecard",
  },
  {
    id: "paystub",
    icon: "earnings_statement",
    label: "Paystub",
  },
  {
    id: "payment-method",
    icon: "credit_card",
    label: "Payment method",
  },
  {
    id: "i9",
    icon: "file_check_in",
    label: "I-9",
    hasWarning: true,
  },
];
