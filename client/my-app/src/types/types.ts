export enum UserType {
  ADRAdmin = "ADRAdmin",
  Parent = "Parent",
  ADRStaff = "ADRStaff",
  SchoolStaff = "SchoolStaff",
};

export type ReadingSchedule = {
  scheduleId: string;
  schoolDistrictId: string;
  readingTerm: string;
  readingYear: string;
  createdBy: string;
  bookId: string;
  chapterIds: string[];
};

export const canCreateUserType = (
  currentUserType: UserType,
  newUserType: UserType,
): boolean => {
  switch (currentUserType) {
    case UserType.ADRAdmin:
      return [
        UserType.ADRAdmin,
        UserType.ADRStaff,
        UserType.SchoolStaff,
      ].includes(newUserType);
    case UserType.ADRStaff:
      return newUserType === UserType.SchoolStaff; // ADR Staff can only create SchoolStaff accounts.
    default:
      return false; // Other types don't have permission to create new accounts.
  }
};
export interface CreateUserResponse {
  message: string;
}
