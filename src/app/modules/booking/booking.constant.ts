export const DEFAULT_BOOKING_INCLUDES = {
  tour: {
    select: {
      id: true,
      title: true,
      location: true,
      images: true,
      guide: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          contactNumber: true,
        }
      }
    }
  },
  tourist: {
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      contactNumber: true,
    }
  },
  payment: true
};