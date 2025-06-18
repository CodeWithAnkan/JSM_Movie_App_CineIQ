// app/(tabs)/profile.tsx - Google Sign-In UI Hidden
import { View, Text, Image, ScrollView, StatusBar, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
// import * as WebBrowser from 'expo-web-browser'; // Can be removed if not used elsewhere
import { images } from "@/constants/images";
import { icons } from "@/constants/icons";
// Removed 'account' and 'OAuthProvider' if they were only for Google Sign-In here
import { getCurrentUser, signIn, signOut, signUp } from '@/services/appwrite';
// import { OAuthProvider } from 'react-native-appwrite'; // Commented out

const Profile = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // console.log("Profile component rendering. isLoading:", isLoading, "currentUser:", currentUser);

    useEffect(() => {
        // console.log("Profile useEffect triggered.");
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                // console.log("Calling getCurrentUser in useEffect...");
                const user = await getCurrentUser();
                // console.log("useEffect - getCurrentUser returned:", user ? user.$id : null);
                setCurrentUser(user);
            } catch (error) {
                console.error("Error fetching user in useEffect:", error);
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
                // console.log("useEffect - fetchUser finished. isLoading set to false.");
            }
        };
        fetchUser();
    }, []);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter email and password.");
            return;
        }
        setIsLoading(true);
        try {
            await signIn(email, password);
            const user = await getCurrentUser();
            setCurrentUser(user);
        } catch (error: any) {
            Alert.alert("Sign In Failed", error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
            setEmail('');
            setPassword('');
        }
    };

    const handleSignUp = async () => {
        if (!email || !password || !username) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        setIsLoading(true);
        try {
            await signUp(email, password, username);
            const user = await getCurrentUser();
            setCurrentUser(user);
        } catch (error: any) {
            Alert.alert("Sign Up Failed", error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
            setEmail('');
            setPassword('');
            setUsername('');
        }
    };

    const handleSignOut = async () => {
        setIsLoading(true);
        try {
            await signOut();
            setCurrentUser(null);
        } catch (error: any) {
            Alert.alert("Sign Out Failed", error.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    /*
    // Google Sign-In handler - COMMENTED OUT
    const handleGoogleSignIn = async () => {
        Alert.alert("Google Sign-In", "To be implemented in the next step!");
        // setIsLoading(true);
        // try {
        //     const successUrl = 'movies://oauth/success';
        //     const failureUrl = 'movies://oauth/failure';
        //     console.log("Attempting Google OAuth with Appwrite. Success URL:", successUrl, "Failure URL:", failureUrl);
        //     await account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl);
        // } catch (error: any) {
        //     Alert.alert("Google Sign-In Error", error.message || "Could not start Google Sign-In process.");
        //     console.error("Google Sign-In error in handleGoogleSignIn:", error);
        //     setIsLoading(false);
        // }
    };
    */

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setEmail('');
        setPassword('');
        setUsername('');
    };

    return (
        <View className="flex-1 bg-primary">
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <Image
                source={images.bg}
                className="absolute w-full h-full z-0"
                resizeMode="cover"
            />

            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: "100%", paddingBottom: 100, paddingTop: 20 }}
            >
                <View className="items-center mt-10 mb-5">
                    <Image
                        source={icons.logo}
                        className="w-16 h-14"
                        resizeMode="contain"
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#FFFFFF" className="mt-10" />
                ) : currentUser ? (
                    // Logged-in view
                    <View className="items-center">
                        <Text className="text-2xl text-white font-bold text-center mb-4">Profile</Text>
                        <Text className="text-lg text-gray-300 text-center mb-6">
                            Welcome, {currentUser.name || currentUser.email}!
                        </Text>
                        {/* {currentUser.emailVerification === false && (
                            <View className="bg-yellow-500 p-3 rounded-lg mb-4 w-full max-w-sm items-center">
                                <Text className="text-black text-center">
                                    Your email is not verified. Please check your inbox.
                                </Text>
                            </View>
                        )} */}
                        <TouchableOpacity
                            onPress={handleSignOut}
                            className="bg-accent p-3 rounded-lg items-center w-full max-w-sm"
                        >
                            <Text className="text-white font-semibold text-base">Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Logged-out view
                    <View className="w-full max-w-sm mx-auto">
                        <Text className="text-2xl text-white font-bold text-center mb-6">
                            {isLoginView ? "Login" : "Sign Up"}
                        </Text>
                        <TextInput
                            className="bg-gray-800 text-white p-4 rounded-lg mb-4 w-full text-base"
                            placeholder="Email" placeholderTextColor="#7B7B8B"
                            value={email} onChangeText={setEmail}
                            keyboardType="email-address" autoCapitalize="none"
                        />
                        <TextInput
                            className="bg-gray-800 text-white p-4 rounded-lg mb-4 w-full text-base"
                            placeholder="Password" placeholderTextColor="#7B7B8B"
                            value={password} onChangeText={setPassword} secureTextEntry
                        />
                        {!isLoginView && (
                            <TextInput
                                className="bg-gray-800 text-white p-4 rounded-lg mb-6 w-full text-base"
                                placeholder="Username" placeholderTextColor="#7B7B8B"
                                value={username} onChangeText={setUsername} autoCapitalize="none"
                            />
                        )}
                        <TouchableOpacity
                            onPress={isLoginView ? handleSignIn : handleSignUp}
                            className="bg-accent p-4 rounded-lg items-center w-full mb-4"
                        >
                            <Text className="text-white font-semibold text-base">
                                {isLoginView ? "Login" : "Sign Up"}
                            </Text>
                        </TouchableOpacity>

                        {/* "OR" Separator and Google Sign-In Button - COMMENTED OUT
                        <View className="flex-row items-center my-4">
                            <View className="flex-1 h-px bg-gray-600" />
                            <Text className="text-gray-400 px-4">OR</Text>
                            <View className="flex-1 h-px bg-gray-600" />
                        </View>

                        <TouchableOpacity
                            // onPress={handleGoogleSignIn}
                            className="bg-white p-3 rounded-lg items-center w-full flex-row justify-center"
                        >
                            <Text className="text-black font-semibold text-base">
                                Sign in with Google
                            </Text>
                        </TouchableOpacity>
                        */}

                        <TouchableOpacity onPress={toggleView} className="items-center mt-6">
                            <Text className="text-gray-400 text-base">
                                {isLoginView
                                    ? "Don't have an account? Sign Up"
                                    : "Already have an account? Login"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

export default Profile;