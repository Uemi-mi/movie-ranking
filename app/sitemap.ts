import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const BASE_URL = "https://movie-ranking-rouge.vercel.app";

type Movie = {
  id: number;
};

export default function sitemap(): MetadataRoute.Sitemap {
  const dataDirectory = path.join(
    process.cwd(),
    "app",
    "data",
    "movies"
  );

  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  if (!fs.existsSync(dataDirectory)) {
    return urls;
  }

  const files = fs
    .readdirSync(dataDirectory)
    .filter(
      (file) =>
        file.endsWith(".json") &&
        /^\d{4}\.json$/.test(file)
    );

  for (const file of files) {
    const filePath = path.join(dataDirectory, file);

    try {
      const data = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      let movies: Movie[] = [];

      // 現在のJSON形式
      if (Array.isArray(data)) {
        movies = data;
      }

      // 以前のJSON形式にも対応
      else if (data && Array.isArray(data.movies)) {
        movies = data.movies;
      }

      for (const movie of movies) {
        if (!movie.id) {
          continue;
        }

        urls.push({
          url: `${BASE_URL}/movies/${movie.id}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    } catch (error) {
      console.error(
        `Sitemap error: ${file}`,
        error
      );
    }
  }

  return urls;
}