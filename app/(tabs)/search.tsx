import {View, Text, Image, FlatList, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react'
import {images} from "@/constants/images";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import MovieCard from "@/components/MovieCard";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {updateSearchCount} from "@/services/appwrite";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const {
        data: movies,
        loading,
        error,
        refetch: loadMovies,
        reset
    } = useFetch(() => fetchMovies({ query: searchQuery }), false)

    useEffect(() => {
        const timeoutID = setTimeout(async () => {
            if (searchQuery.trim()) {
                console.log("Fetching movies for search:", searchQuery);
                await loadMovies(); // This updates 'movies' asynchronously
            } else {
                console.log("Search query is empty. Resetting...");
                reset();
            }
        }, 800);

        return () => clearTimeout(timeoutID);
    }, [searchQuery]);

// New Effect: Runs when 'movies' is updated
    useEffect(() => {
        if (movies?.length > 0) {
            console.log("Movies found! Updating search count...");
            updateSearchCount(searchQuery, movies[0]);
        }
    }, [movies]);  // This runs only when movies updates


    return (
        <View className="flex-1 bg-primary">
            <Image source={images.bg} className="flex-1 absolute w-full z-0" resizeMode="cover"/>

            <FlatList data={movies}
                      renderItem={({ item }) => (
                <MovieCard
                    {...item}
                />
            )}
                      keyExtractor={(item) => item.id.toString()}
                      className="px-5"
                      numColumns={3}
                      columnWrapperStyle={{
                          justifyContent: 'center',
                          gap: 16,
                          marginVertical: 16
                      }} contentContainerStyle={{paddingBottom: 100}}
                      ListHeaderComponent={
                <>
                    <View className="w-full flex-row justify-center mt-20">
                        <Image source={icons.logo} className="w-12 h-10"/>
                    </View>
                    <View className="my-5">
                        <SearchBar placeholder="Search movies..."
                        value={searchQuery} onChangeText={(text: string) => setSearchQuery(text)}
                        />
                    </View>

                    {loading && (
                        <ActivityIndicator size="large" color="0000ff" className="my-3"/>
                    )}
                    {error && (
                        <Text className="text-red-500 px-5 my-3">Error: {error.message}</Text>
                    )}
                    {!loading && !error && searchQuery.trim() && movies?.length > 0 && (
                        <Text className="text-xl text-white font-bold">
                            Search Results for{' '}
                            <Text className="text-accent">{searchQuery}</Text>
                        </Text>
                    )}
                </>
                      }
                      ListEmptyComponent={
                        !loading && !error ? (
                            <View className="flex items-center mt-10 px-5">
                                <Text className="text-light-300 font-thin">{searchQuery.trim() ? 'No movies found' : 'Search for a movie'}
                                </Text>
                            </View>
                        ) : null
                      }

            />
        </View>
    )
}
export default Search;