import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState, useEffect } from 'react';
import { Link, useRouter } from "expo-router";
import { icons } from "@/constants/icons";
import { getCurrentUser, saveMovie, unsaveMovie, getSavedMovieDocumentId } from "@/services/appwrite";

interface Movie {
    id: number;
    poster_path: string | null;
    title: string;
    vote_average: number;
    release_date: string;
    adult?: boolean;
    backdrop_path?: string;
    genre_ids?: number[];
    original_language?: string;
    original_title?: string;
    overview?: string;
    popularity?: number;
    video?: boolean;
    vote_count?: number;
}

interface MovieCardProps extends Movie {
    sessionActivityKey?: number;
}

const MovieCard = ({
                       id, poster_path, title, vote_average, release_date, sessionActivityKey,
                       adult, backdrop_path, genre_ids, original_language, original_title,
                       overview, popularity, video, vote_count
                   }: MovieCardProps) => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isSaveLoading, setIsSaveLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setIsAuthLoading(true);
            try {
                // console.log(`MovieCard (${title}, key: ${sessionActivityKey}): Calling getCurrentUser...`);
                const user = await getCurrentUser();
                // console.log(`MovieCard (${title}, key: ${sessionActivityKey}): getCurrentUser returned:`, user ? user.$id : null);
                setCurrentUser(user);
            } catch (error) {
                console.error(`MovieCard (${title}, key: ${sessionActivityKey}): Error fetching user:`, error);
                setCurrentUser(null);
            } finally {
                setIsAuthLoading(false);
            }
        };
        fetchUser();
    }, [sessionActivityKey, title]);

    useEffect(() => {
        const checkIfSaved = async () => {
            if (isAuthLoading || !currentUser || !id) {
                if (!currentUser && !isAuthLoading) {
                    setIsSaved(false);
                    setSavedDocId(null);
                }
                return;
            }
            setIsSaveLoading(true);
            try {
                const docId = await getSavedMovieDocumentId(currentUser.$id, id);
                if (docId) {
                    setIsSaved(true);
                    setSavedDocId(docId);
                } else {
                    setIsSaved(false);
                    setSavedDocId(null);
                }
            } catch (error) {
                console.error(`MovieCard (${title}): Error checking saved status:`, error);
                setIsSaved(false);
                setSavedDocId(null);
            } finally {
                setIsSaveLoading(false);
            }
        };
        checkIfSaved();
    }, [currentUser, id, isAuthLoading, title]);

    const handleSaveToggle = async () => {
        // console.log(`MovieCard (${title}) handleSaveToggle - currentUser at start:`, currentUser ? currentUser.$id : null, "isAuthLoading:", isAuthLoading, "isSaveLoading:", isSaveLoading);

        if (isAuthLoading || isSaveLoading) return;

        if (!currentUser) {
            router.push('/(tabs)/profile');
            return;
        }

        setIsSaveLoading(true);
        const movieDataForSave: Movie = {
            id: id,
            poster_path: poster_path,
            title: title,
            vote_average: vote_average,
            release_date: release_date,
            adult: typeof adult === 'boolean' ? adult : false,
            backdrop_path: backdrop_path ?? "",
            genre_ids: genre_ids ?? [],
            original_language: original_language ?? "",
            original_title: original_title ?? "",
            overview: overview ?? "",
            popularity: popularity ?? 0,
            video: video ?? false,
            vote_count: vote_count ?? 0
        };

        try {
            if (isSaved && savedDocId) {
                await unsaveMovie(savedDocId);
                setIsSaved(false);
                setSavedDocId(null);
            } else {
                // @ts-ignore
                const newDoc = await saveMovie(currentUser.$id, movieDataForSave);
                if (newDoc && newDoc.$id) {
                    setIsSaved(true);
                    setSavedDocId(newDoc.$id);
                } else {
                    const newIdAfterSave = await getSavedMovieDocumentId(currentUser.$id, id);
                    if (newIdAfterSave) {
                        setIsSaved(true);
                        setSavedDocId(newIdAfterSave);
                    } else {
                        console.error(`MovieCard (${title}): newDoc was not valid and getSavedMovieDocumentId also failed after save.`);
                        throw new Error("Failed to retrieve document ID after saving.");
                    }
                }
            }
        } catch (error: any) {
            Alert.alert("Error", error.message || "Could not update saved status.");
            console.error(`MovieCard (${title}): Error toggling save:`, error);
        } finally {
            setIsSaveLoading(false);
        }
    };

    const imageUri = poster_path
        ? `https://image.tmdb.org/t/p/w500${poster_path}`
        : 'https://placehold.co/600x400/1a1a1a/ffffff.png?text=No+Image';

    return (
        // REMOVED w-[30%] from here. It will now take the width from its parent container.
        <View className="relative flex-1"> {/* Added flex-1 to help it expand if parent is flex */}
            <Link href={`/movies/${id}`} asChild>
                <TouchableOpacity className="w-full">
                    <Image
                        source={{ uri: imageUri }}
                        className="w-full h-52 rounded-lg bg-gray-800"
                        resizeMode="cover"
                    />
                    <Text className="text-sm font-bold text-white mt-2" numberOfLines={1}>{title}</Text>
                    <View className="flex-row items-center justify-start gap-x-1">
                        <Image source={icons.star} className="size-4"/>
                        <Text className="text-xs text-white font-bold uppercase">{vote_average ? Math.round(vote_average / 2) : 'N/A'}</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-light-300 font-medium mt-1">
                            {release_date?.split('-')[0] || 'Unknown'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Link>
            {!isAuthLoading && (
                <TouchableOpacity
                    onPress={handleSaveToggle}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 rounded-full"
                    disabled={isSaveLoading}
                >
                    <Image
                        source={icons.save}
                        className="w-5 h-5"
                        style={{ tintColor: isSaveLoading ? 'gray' : isSaved ? '#FFD700' : '#FFFFFF' }}
                    />
                </TouchableOpacity>
            )}
        </View>
    )
}
export default MovieCard;