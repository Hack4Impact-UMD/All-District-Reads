import { getFunctions, httpsCallable } from "firebase/functions";

export function createAdminUser(userId: string, email: string, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const functions = getFunctions();
    const createAdminCloudFunction = httpsCallable(
      functions,
      "createAdminUser",
    );

    createAdminCloudFunction({
      userId: userId,
      email: email,
      name: name,
      schoolDistrictId: "",
      numChildren: "",
      userType: "ADRAdmin",
    })
      .then(async () => {
        resolve();
      })
      .catch((error) => {
        console.log(error.message);
        reject(error);
      });
  });
}

export function createADRStaffUser(userId: string, email: string, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const functions = getFunctions();
    const createADRStaffCloudFunction = httpsCallable(
      functions,
      "createADRStaffUser",
    );

    createADRStaffCloudFunction({
      userId: userId,
      email: email,
      name: name,
      numChildren: "",
      schoolDistrictId: "",
      userType: "ADRStaff",
    })
      .then(async () => {
        resolve();
      })
      .catch((error) => {
        console.log(error.message);
        reject(error);
      });
  });
}

export function createSchoolStaffUser(userId: string, email: string, name: string, schoolDistrictId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const functions = getFunctions();
    const createSchoolStaffCloudFunction = httpsCallable(
      functions,
      "createSchoolStaffUser",
    );

    createSchoolStaffCloudFunction({
      userId: userId,
      email: email,
      name: name,
      numChildren: "",
      schoolId: "",
      schoolDistrictId: schoolDistrictId,
      userType: "SchoolStaff",
    })
      .then(async () => {
        resolve();
      })
      .catch((error) => {
        console.log(error.message);
        reject(error);
      });
  });
}
