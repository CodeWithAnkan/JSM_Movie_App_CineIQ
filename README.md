# Movie App

A React Native movie search and trending tracker app built with Expo and Appwrite.

## Features
- Search for movies using an API
- Store search terms and track their count using Appwrite
- Display trending movies based on search frequency
- Optimized with React Native and Tailwind CSS

## Tech Stack
- **React Native** (Expo)
- **Appwrite** (Database & Authentication)
- **Tailwind CSS** (UI Styling)
- **TypeScript**

## Setup & Installation
### Prerequisites
- Install [Node.js](https://nodejs.org/)
- Install [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Sign up for [Appwrite](https://appwrite.io/)

### Clone the Repository
```sh
git clone https://github.com/your-username/movie-app.git
cd movie-app
```

### Install Dependencies
```sh
npm install
```

### Setup Environment Variables
Create a `.env` file in the root directory and add:
```sh
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
EXPO_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id
```

### Run the Project
```sh
npx expo start
```

## Building an APK
1. Install EAS CLI:
   ```sh
   npm install -g eas-cli
   ```
2. Authenticate with Expo:
   ```sh
   eas login
   ```
3. Create an `eas.json` file with the following configuration:
   ```json
   {
     "cli": {
       "version": ">= 15.0.15",
       "appVersionSource": "remote"
     },
     "build": {
       "preview": {
         "distribution": "internal",
         "android": {
           "buildType": "apk"
         }
       },
       "production": {
         "autoIncrement": true,
         "distribution": "store",
         "android": {
           "buildType": "apk"
         }
       }
     }
   }
   ```
4. Run the build command:
   ```sh
   eas build --platform android --profile preview
   ```

## Folder Structure
```
movie-app/
│── src/
│   ├── components/        # UI components
│   ├── screens/           # App screens
│   ├── services/          # API & database logic
│   ├── hooks/             # Custom hooks
│   ├── navigation/        # Navigation setup
│── assets/                # Images and icons
│── app.json               # Expo configuration
│── eas.json               # EAS build configuration
│── .env                   # Environment variables
│── package.json           # Dependencies
│── README.md              # Project documentation
```

## Contributing
Feel free to fork the repo and submit a pull request!

## License
This project is open-source and available under the MIT License.

