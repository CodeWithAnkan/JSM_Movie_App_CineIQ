import { ActivityIndicator, FlatList, Image, ScrollView, StatusBar, Text, View } from "react-native";
import React, { useState, useCallback, useEffect } from 'react'; // Added useState, useCallback, useEffect
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from '@react-navigation/native'; // Common import for this hook

import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import useFetch from "@/services/useFetch"; // Assuming this is your custom hook for TMDB
import { fetchMovies } from "@/services/api"; // Assuming this is your TMDB fetch
import MovieCard from "@/components/MovieCard";
import { getTrendingMovies } from "@/services/appwrite"; // Appwrite for trending (if still used this way)
import TrendingCards from "@/components/TrendingCards";
// We don't strictly need getCurrentUser here unless index.tsx itself changes UI based on it.
// The sessionActivityKey will just signal MovieCards to re-check.

export default function Index() {
    const router = useRouter();

    // For Trending Movies (Appwrite based)
    const {
        data: trendingMoviesData, // Renamed to avoid conflict if 'movies' is used elsewhere
        loading: trendingLoading,
        error: trendingError,
    } = useFetch(getTrendingMovies); // This useFetch is for Appwrite's getTrendingMovies

    // For Latest Movies (TMDB API based)
    const {
        data: latestMoviesData, // Renamed to be specific
        loading: latestMoviesLoading,
        error: latestMoviesError
    } = useFetch(() => fetchMovies({ query: '' })); // This useFetch is for TMDB's fetchMovies

    // State to trigger re-check in MovieCard components
    const [sessionActivityKey, setSessionActivityKey] = useState(0);

    useFocusEffect(
        useCallback(() => {
            console.log("Home Screen (index.tsx) focused. Updating sessionActivityKey.");
            setSessionActivityKey(prevKey => prevKey + 1);
            // No need to call getCurrentUser() here unless this screen itself
            // needs to change its own UI based on login state.
            // Incrementing the key is enough to trigger MovieCard's useEffect.
        }, []) // Empty dependency array means it runs every time the screen comes into focus
    );

    // Combine loading states
    const isLoading = trendingLoading || latestMoviesLoading;
    // Combine error states (simplified, you might want more granular error display)
    const hasError = trendingError || latestMoviesError;
    const errorMessage = trendingError?.message || latestMoviesError?.message;

    return (
        <View className="flex-1 bg-primary">
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Image source={images.bg} className="absolute w-full z-0"/> {/* Consider h-full if needed */}

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }} // Increased paddingBottom for tab bar
            >
                <Image source={icons.logo} className="w-12 h-10 mx-auto mt-10 mb-5"/>

                {isLoading ? (
                    <ActivityIndicator
                        size="large"
                        color="#00A7F7" // Changed color to a common accent
                        className="mt-20 self-center" // Increased margin top
                    />
                ): hasError ? (
                    <View className="mt-10 items-center">
                        <Text className="text-red-500 text-lg">Error loading movies.</Text>
                        <Text className="text-red-400 text-sm">{errorMessage}</Text>
                    </View>
                ): (
                    <View className="flex-1 mt-5">
                        <SearchBar
                            onPress={() => router.push("/search")}
                            placeholder="Search for a movie"
                        />

                        {/* Trending Movies Section */}
                        {trendingMoviesData && trendingMoviesData.length > 0 && (
                            <View className="mt-10">
                                <Text className="text-lg text-white font-bold mb-3">Trending Movies</Text>
                                <FlatList
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="mb-4 mt-3"
                                    data= {trendingMoviesData} // Use renamed data
                                    contentContainerStyle={{ gap: 20 }} // Simplified gap
                                    renderItem={({item, index}) =>(
                                        // Assuming TrendingCards does not need sessionActivityKey
                                        // If it also needs to react to login state, pass the key
                                        <TrendingCards movie={item} index={index}/>
                                    )}
                                    keyExtractor={(item) => item.movie_id?.toString() || item.$id?.toString()} // More robust key
                                    ItemSeparatorComponent={() => <View className="w-4" />} // Keep if you like this spacing
                                />
                            </View>
                        )}

                        {/* Latest Movies Section */}
                        {latestMoviesData && latestMoviesData.length > 0 && (
                            <View className="mt-8"> {/* Added margin top for separation */}
                                <Text className="text-lg text-white font-bold mt-5 mb-3">Latest Movies</Text>
                                <FlatList
                                    data={latestMoviesData} // Use renamed data
                                    renderItem={({ item }) => (
                                        <MovieCard
                                            {...item} // Spread all movie item props
                                            sessionActivityKey={sessionActivityKey} // Pass the new prop
                                        />
                                    )}
                                    keyExtractor={(item) => item.id.toString()}
                                    numColumns={3}
                                    columnWrapperStyle={{
                                        justifyContent: 'flex-start', // Or 'space-between' if you prefer
                                        gap: 10, // Adjusted gap
                                        // paddingRight: 5, // Consider removing if gap is enough
                                        marginBottom: 10
                                    }}
                                    className="mt-2 pb-32" // pb-32 to ensure space above tab bar if not using overall paddingBottom
                                    scrollEnabled={false} // This FlatList is inside a ScrollView
                                />
                            </View>
                        )}
                        {(!latestMoviesData || latestMoviesData.length === 0) && !latestMoviesLoading && (
                            <Text className="text-gray-400 text-center mt-10">No latest movies found.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};