// API module for score management
// Uses Axios for HTTP requests
import API from "./Api";
// Logger module for logging
import { logger, LogTags } from "../lib/logger";

// Save a new score
export async function saveScore(payload) {
  try {
    logger.info("Saving score", payload, LogTags.SAVE_SCORE);
    // Call the save score endpoint
    const res = await API.post("/api/scores", payload);
    // Log successful save
    logger.info(
      "Score saved successfully",
      { scoreId: res.data?.id },
      LogTags.SAVE_SCORE
    );
    return res.data;
  } catch (error) {
    logger.error("Failed to save score", error, payload, LogTags.SAVE_SCORE);
    throw error;
  }
}

// Fetch scores with optional game filter and limit
export async function fetchScores(game = "word-guess", limit = 10) {
  try {
    logger.debug("Fetching scores", { game, limit }, LogTags.FETCH_SCORES);
    // Call the fetch scores endpoint
    const res = await API.get("/api/scores", { params: { game, limit } });
    // Log successful fetch
    logger.debug(
      "Scores fetched successfully",
      { game, count: res.data?.length },
      LogTags.FETCH_SCORES
    );
    return res.data;
  } catch (error) {
    logger.error(
      "Failed to fetch scores",
      error,
      { game, limit },
      LogTags.FETCH_SCORES
    );
    throw error;
  }
}

// Fetch my scores
export async function fetchMyScores(game) {
  try {
    logger.debug("Fetching my scores", { game }, LogTags.MY_SCORES);
    // Call the fetch my scores endpoint
    const res = await API.get("/api/scores/me", { params: { game } });
    // Log successful fetch
    logger.debug(
      "My scores fetched successfully",
      { game, count: res.data?.length },
      LogTags.MY_SCORES
    );
    return res.data;
  } catch (error) {
    logger.error(
      "Failed to fetch my scores",
      error,
      { game },
      LogTags.MY_SCORES
    );
    throw error;
  }
}

// Fetch user progress
export async function fetchProgress() {
  try {
    logger.debug("Fetching user progress", {}, LogTags.FETCH_PROGRESS);
    // Call the fetch progress endpoint
    const res = await API.get("/api/progress/me");
    // Log successful fetch
    logger.debug(
      "User progress fetched successfully",
      { totalGames: res.data?.totalGames },
      LogTags.FETCH_PROGRESS
    );
    return res.data;
  } catch (error) {
    logger.error(
      "Failed to fetch user progress",
      error,
      {},
      LogTags.FETCH_PROGRESS
    );
    throw error;
  }
}
