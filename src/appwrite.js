import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID, // databaseId
      COLLECTION_ID, // collectionId
      [Query.equal("searchTerm", searchTerm)] // queries (optional)
    );

    if (result?.documents?.length > 0) {
      const doc = result.documents[0];

      await databases.updateDocument(
        DATABASE_ID, // databaseId
        COLLECTION_ID, // collectionId
        doc.$id, // documentId
        {
          count: doc?.count + 1,
        } // data (optional)
      );
    } else {
      await databases.createDocument(
        DATABASE_ID, // databaseId
        COLLECTION_ID, // collectionId
        ID.unique(), // documentId
        {
          searchTerm: searchTerm,
          count: 1,
          $id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        } // data (optional)
      );
    }
  } catch (error) {
    console.log(error);
  }

  console.log(PROJECT_ID, COLLECTION_ID, DATABASE_ID);
};

export const getTrendingMovies = async () => {
  const result = await databases.listDocuments(
    DATABASE_ID, // databaseId
    COLLECTION_ID, // collectionId
    [Query.limit(10), Query.orderDesc("count")] // queries (optional)
  );

  return result.documents;
};
