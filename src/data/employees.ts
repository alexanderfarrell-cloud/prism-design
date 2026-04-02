export interface ProjectAssignment {
  name: string;
  dateRange: string;
}

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredName: string;
  ssn: string;
  dateOfBirth: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  personalEmail: string;
  workEmail: string;
  mobilePhone: string;
  homePhone: string;
  workPhone: string;
}

import type { LaborTypeAssignment } from "./laborTypes";

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  initials: string;
  avatarUrl: string;
  projects: ProjectAssignment[];
  defaultJob: string;
  personalInfo: PersonalInfo;
  laborTypes: LaborTypeAssignment[];
}

export const EMPLOYEES: Employee[] = [
  {
    id: "1",
    employeeNumber: "#00187",
    name: "Sarah Johnson",
    role: "Project Manager",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
    status: "Active",
    initials: "SJ",
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    projects: [
      { name: "Martingale Wharf", dateRange: "2007-0013" },
      { name: "Riverfront Plaza", dateRange: "2024-0201" },
      { name: "Cedar Heights Tower", dateRange: "2025-0044" },
      { name: "Lakeside Commons", dateRange: "2025-0078" },
    ],
    defaultJob: "Martingale Wharf",
    laborTypes: [
      { laborTypeId: "project-manager", isDefault: true },
      { laborTypeId: "foreman-l1", isDefault: false },
    ],
    personalInfo: {
      firstName: "Sarah",
      middleName: "Marie",
      lastName: "Johnson",
      suffix: "",
      preferredName: "Sarah",
      ssn: "***-**-4589",
      dateOfBirth: "1985-03-14",
      address1: "742 Evergreen Terrace",
      address2: "Apt 3B",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
      country: "United States",
      personalEmail: "sarah.j@gmail.com",
      workEmail: "sarah.johnson@example.com",
      mobilePhone: "(555) 123-4567",
      homePhone: "(555) 123-9999",
      workPhone: "(555) 100-0001",
    },
  },
  {
    id: "2",
    employeeNumber: "#00234",
    name: "Michael Chen",
    role: "Carpenter",
    email: "michael.chen@example.com",
    phone: "(555) 234-5678",
    status: "Active",
    initials: "MC",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    projects: [
      { name: "Elm Street Bridge", dateRange: "2024-0087" },
      { name: "Oak Park Renovation", dateRange: "2025-0033" },
      { name: "Hillside Apartments", dateRange: "2025-0091" },
    ],
    defaultJob: "Elm Street Bridge",
    laborTypes: [
      { laborTypeId: "carpenter-l1", isDefault: true },
      { laborTypeId: "carpenter-l2", isDefault: false },
    ],
    personalInfo: {
      firstName: "Michael",
      middleName: "",
      lastName: "Chen",
      suffix: "",
      preferredName: "Mike",
      ssn: "***-**-7823",
      dateOfBirth: "1990-07-22",
      address1: "1200 NW Marshall St",
      address2: "",
      city: "Portland",
      state: "OR",
      zipCode: "97209",
      country: "United States",
      personalEmail: "mike.chen@gmail.com",
      workEmail: "michael.chen@example.com",
      mobilePhone: "(555) 234-5678",
      homePhone: "",
      workPhone: "(555) 100-0002",
    },
  },
  {
    id: "3",
    employeeNumber: "#00312",
    name: "Jessica Williams",
    role: "Electrician",
    email: "jessica.williams@example.com",
    phone: "(555) 345-6789",
    status: "Active",
    initials: "JW",
    avatarUrl: "https://randomuser.me/api/portraits/women/68.jpg",
    projects: [
      { name: "Harbor View Tower", dateRange: "2024-0102" },
      { name: "Pine Ridge Mall", dateRange: "2023-0045" },
      { name: "Westfield Industrial Park", dateRange: "2025-0112" },
      { name: "Sunrise Medical Center", dateRange: "2025-0067" },
    ],
    defaultJob: "Harbor View Tower",
    laborTypes: [
      { laborTypeId: "electrician-l1", isDefault: true },
      { laborTypeId: "electrician-l2", isDefault: false },
    ],
    personalInfo: {
      firstName: "Jessica",
      middleName: "Anne",
      lastName: "Williams",
      suffix: "",
      preferredName: "Jess",
      ssn: "***-**-3341",
      dateOfBirth: "1988-11-05",
      address1: "890 SE Hawthorne Blvd",
      address2: "Unit 12",
      city: "Portland",
      state: "OR",
      zipCode: "97214",
      country: "United States",
      personalEmail: "jess.williams@yahoo.com",
      workEmail: "jessica.williams@example.com",
      mobilePhone: "(555) 345-6789",
      homePhone: "(555) 345-0000",
      workPhone: "(555) 100-0003",
    },
  },
  {
    id: "4",
    employeeNumber: "#00415",
    name: "Robert Davis",
    role: "Site Supervisor",
    email: "robert.davis@example.com",
    phone: "(555) 456-7890",
    status: "Inactive",
    initials: "RD",
    avatarUrl: "https://randomuser.me/api/portraits/men/75.jpg",
    projects: [
      { name: "Grand Ave Office Complex", dateRange: "2024-0188" },
      { name: "Bayview Condominiums", dateRange: "2025-0021" },
      { name: "Metro Transit Hub", dateRange: "2025-0055" },
    ],
    defaultJob: "Grand Ave Office Complex",
    laborTypes: [
      { laborTypeId: "site-supervisor", isDefault: true },
      { laborTypeId: "foreman-l2", isDefault: false },
    ],
    personalInfo: {
      firstName: "Robert",
      middleName: "James",
      lastName: "Davis",
      suffix: "Jr.",
      preferredName: "Rob",
      ssn: "***-**-6712",
      dateOfBirth: "1979-01-30",
      address1: "3300 SW River Pkwy",
      address2: "",
      city: "Portland",
      state: "OR",
      zipCode: "97239",
      country: "United States",
      personalEmail: "rob.davis@outlook.com",
      workEmail: "robert.davis@example.com",
      mobilePhone: "(555) 456-7890",
      homePhone: "(555) 456-0000",
      workPhone: "(555) 100-0004",
    },
  },
  {
    id: "5",
    employeeNumber: "#00523",
    name: "Emily Martinez",
    role: "Safety Inspector",
    email: "emily.martinez@example.com",
    phone: "(555) 567-8901",
    status: "Active",
    initials: "EM",
    avatarUrl: "https://randomuser.me/api/portraits/women/21.jpg",
    projects: [
      { name: "Downtown Plaza", dateRange: "2024-0156" },
      { name: "Northgate Warehouse", dateRange: "2025-0009" },
      { name: "Willow Creek School", dateRange: "2025-0130" },
    ],
    defaultJob: "Downtown Plaza",
    laborTypes: [
      { laborTypeId: "safety-inspector", isDefault: true },
    ],
    personalInfo: {
      firstName: "Emily",
      middleName: "Rose",
      lastName: "Martinez",
      suffix: "",
      preferredName: "Emily",
      ssn: "***-**-9054",
      dateOfBirth: "1992-06-18",
      address1: "450 NE Alberta St",
      address2: "Suite 5",
      city: "Portland",
      state: "OR",
      zipCode: "97211",
      country: "United States",
      personalEmail: "emily.m@gmail.com",
      workEmail: "emily.martinez@example.com",
      mobilePhone: "(555) 567-8901",
      homePhone: "",
      workPhone: "(555) 100-0005",
    },
  },
];

export function getEmployeeById(id: string): Employee | undefined {
  return EMPLOYEES.find((emp) => emp.id === id);
}
