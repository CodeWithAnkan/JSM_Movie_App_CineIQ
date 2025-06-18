import { Client, Databases, ID, Query, Account, Permission, Role } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const SAVED_MOVIES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_MOVIES_COLLECTION_ID!;

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
export const account = new Account(client);

// Sign Up
export async function signUp(email: string, password: string, username: string | undefined) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );

        if (!newAccount) throw Error;

        await signIn(email, password);

        return newAccount;
    } catch (error) {
        console.log(error);
        throw new Error();
    }
}

// Sign In
export async function signIn(email: string, password: string) {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        throw new Error();
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();
        return currentAccount;
    } catch (error) {
        return null;
    }
}

// Sign Out
export async function signOut() {
    try {
        const session = await account.deleteSession("current");

        return session;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred during sign out.");
        }
    }
}

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        console.log("Checking for existing search term:", query);
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal("searchTerm", query),
        ]);

        console.log("Query Result:", result);

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];
            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1,
                }
            );
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                title: movie.title,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error updating search count:", error);
        throw error;
    }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.log(error)
        return undefined;
    }
}

// Save a movie
export async function saveMovie(userId: string, movie: Movie) { // Ensure Movie type is defined/imported if you have it
    try {
        const documentId = ID.unique(); // Generate ID beforehand

        // Ensure movie.id, movie.title etc. are valid and coming from your Movie object
        const movieDataPayload = {
            userId: userId,
            movieId: movie.id, // Ensure movie.id is a number if your Appwrite attribute is Number
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            savedAt: new Date().toISOString(),
        };

        const result = await database.createDocument(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            documentId,
            movieDataPayload, // Data
            [ // Permissions array
                Permission.read(Role.user(userId)),    // User can read their own document
                Permission.update(Role.user(userId)),  // User can update their own document
                Permission.delete(Role.user(userId))   // User can delete their own document
            ]
        );
        return result;
    } catch (error: any) {
        console.error("Error saving movie:", error);
        const errorMessage = error && error.message ? error.message : "Failed to save movie.";
        throw new Error(errorMessage);
    }
}

// Unsave a movie
export async function unsaveMovie(documentId: string) {
    try {
        const result = await database.deleteDocument(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            documentId
        );
        return result;
    } catch (error) {
        console.error("Error unsaving movie:", error);
        throw new Error("Failed to unsave movie.");
    }
}

// Get saved movie document ID
export async function getSavedMovieDocumentId(userId: string, movieId: number) {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [
                Query.equal("userId", userId),
                Query.equal("movieId", movieId),
            ]
        );
        if (result.documents.length > 0) {
            return result.documents[0].$id;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting saved movie document ID:", error);
        throw new Error("Failed to get saved movie document ID.");
    }
}

// Get user's saved movies
export async function getUserSavedMovies(userId: string) {
    try {
        const result = await database.listDocuments(
            DATABASE_ID,
            SAVED_MOVIES_COLLECTION_ID,
            [
                Query.equal("userId", userId),
                Query.orderDesc("savedAt"),
            ]
        );
        return result.documents;
    } catch (error) {
        console.error("Error getting user saved movies:", error);
        throw new Error("Failed to get user saved movies.");
    }
}