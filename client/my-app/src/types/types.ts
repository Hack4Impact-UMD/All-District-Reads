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

export interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (
    event: React.MouseEvent<HTMLButtonElement>,
    newPage: number,
  ) => void;
}

export interface ReadingAssignment {
  id: string;
  title: string;
  bookId: string;
  bookTitle?: string;
  readingPeriod: string;
  dueDate: string;
}

export type Chapter = {
  chapterId: string;
  chapterNumber: number;
  questions: string[];
  answers: string[];
};

export type Book = {
  id: string;
  title: string;
  description?: string;
  chapters?: Chapter[];
  imageUrl?: string;
};

export type ChapterQuestions = {
  chapterId: string;
  chapterNumber: number;
  questions: string[];
  answers: string[];
};

export type AddBookFormProps = {
  book: Book;
  onSave: (bookData: Book) => void;
  onClose: () => void;
};


