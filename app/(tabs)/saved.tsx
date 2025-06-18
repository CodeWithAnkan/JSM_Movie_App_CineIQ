import { View, Text, Image, StatusBar, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import { getCurrentUser, getUserSavedMovies } from '@/services/appwrite';
import MovieCard from '@/components/MovieCard'; // Ensure this path is correct

interface SavedMovieDocument {
    $id: string;
    movieId: number;
    title: string;
    poster_path: string | null;
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
    // Add sessionActivityKey if MovieCard expects it, though Saved page doesn't manage this key itself
    sessionActivityKey?: number;
}

const Saved = () => {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [savedMovies, setSavedMovies] = useState<SavedMovieDocument[]>([]);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoadingMovies, setIsLoadingMovies] = useState(false);

    // sessionActivityKey for refreshing MovieCards if needed when Saved tab is focused
    // This is useful if an unsave action on this page should immediately reflect on cards here
    // or if cards need a generic refresh trigger on focus.
    const [sessionActivityKey, setSessionActivityKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            console.log("Saved.tsx - useFocusEffect triggered");
            setSessionActivityKey(prevKey => prevKey + 1); // Update key to refresh MovieCards

            const fetchUserDataAndMovies = async () => {
                setIsLoadingUser(true);
                setIsLoadingMovies(true);
                setSavedMovies([]);
                try {
                    const user = await getCurrentUser();
                    console.log("Saved.tsx - useFocusEffect - getCurrentUser returned:", user ? user.$id : null);
                    setCurrentUser(user);

                    if (user) {
                        const movies = await getUserSavedMovies(user.$id);
                        setSavedMovies(movies as unknown as SavedMovieDocument[] || []);
                    }
                } catch (error) {
                    console.error("SavedScreen: Error in useFocusEffect data fetching:", error);
                    setCurrentUser(null);
                    setSavedMovies([]);
                } finally {
                    setIsLoadingUser(false);
                    setIsLoadingMovies(false);
                }
            };

            fetchUserDataAndMovies();

            return () => {};
        }, [])
    );

    const renderHeader = () => (
        <View className="items-center pt-10 pb-2 px-5">
            <Image
                source={icons.logo}
                className="w-14 h-12"
                resizeMode="contain"
            />
            <Text className="text-2xl text-white font-bold text-center mt-3 mb-6">
                Saved Movies
            </Text>
        </View>
    );

    const renderEmptyState = (message: string, showLoginButton: boolean = false) => (
        <View className="flex-1 justify-center items-center px-5 pb-20">
            <Text className="text-lg text-gray-400 text-center mb-4">{message}</Text>
            {showLoginButton && (
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/profile')}
                    className="bg-accent px-6 py-3 rounded-lg"
                >
                    <Text className="text-white font-semibold text-base">Go to Login</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (isLoadingUser) {
        return (
            <View className="flex-1 bg-primary justify-center items-center">
                {/* Optionally render header here too if desired during user loading */}
                {/* renderHeader() */}
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    if (!currentUser) {
        return (
            <View className="flex-1 bg-primary">
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />
                {renderHeader()}
                {renderEmptyState("Please log in to see your saved movies.", true)}
            </View>
        );
    }

    if (isLoadingMovies) {
        return (
            <View className="flex-1 bg-primary">
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />
                {renderHeader()}
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            </View>
        );
    }

    if (savedMovies.length === 0) {
        return (
            <View className="flex-1 bg-primary">
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
                <Image source={images.bg} className="absolute w-full h-full z-0" resizeMode="cover" />
                {renderHeader()}
                {renderEmptyState("You haven't saved any movies yet.")}
            </View>
        );
    }

    return (
        <View className="flex-1 bg-primary">
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Image
                source={images.bg}
                className="absolute w-full h-full z-0"
                resizeMode="cover"
            />
            <FlatList
                data={savedMovies}
                renderItem={({ item }: { item: SavedMovieDocument }) => (
                    <View className="w-1/2 p-1.5">
                        <MovieCard
                            // Map Appwrite document fields to MovieCard props
                            id={item.movieId}
                            title={item.title}
                            poster_path={item.poster_path}
                            vote_average={item.vote_average}
                            release_date={item.release_date}
                            // Pass other movie props if your MovieCard expects them and they are in SavedMovieDocument
                            adult={item.adult ?? false}
                            backdrop_path={item.backdrop_path ?? ""}
                            // genre_ids={item.genre_ids ?? []} // Assuming genre_ids might not be stored/needed here
                            original_language={item.original_language ?? ""}
                            original_title={item.original_title ?? ""}
                            overview={item.overview ?? ""}
                            popularity={item.popularity ?? 0}
                            video={item.video ?? false}
                            vote_count={item.vote_count ?? 0}
                            sessionActivityKey={sessionActivityKey} // Pass the key
                        />
                    </View>
                )}
                keyExtractor={(item) => item.$id}
                numColumns={2}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 10 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

export default Saved;