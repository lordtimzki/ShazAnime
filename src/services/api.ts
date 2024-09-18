import axios from "axios";

const AUDD_API_URL = "https://api.audd.io/";
const AUDD_API_TOKEN = "d9326b0b75862bb67e64af7b59698446";
const ANIME_THEMES_API_URL = "https://api.animethemes.moe";

export async function identifySong(audioData: Blob): Promise<any> {
  const formData = new FormData();
  formData.append("file", audioData, "audio.webm");
  formData.append("return", "apple_music,spotify");
  formData.append("api_token", AUDD_API_TOKEN);

  try {
    const response = await axios.post(AUDD_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error identifying song:", error);
    throw error;
  }
}

export async function searchAnimeTheme(songInfo: {
  title: string;
  artist: string;
}): Promise<any> {
  try {
    console.log("Searching for anime theme:", songInfo);
    const response = await axios.get(`${ANIME_THEMES_API_URL}/search`, {
      params: {
        q: `${songInfo.title} ${songInfo.artist}`,
        fields: ["song"],
        include: "animethemes.anime,animethemes.animethemeentries.videos",
      },
    });
    console.log("AnimeThemes API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching for anime theme:", error);
    throw error;
  }
}
