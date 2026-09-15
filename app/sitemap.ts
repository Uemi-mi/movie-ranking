import type { MetadataRoute } from "next";

const BASE_URL = "https://movie-ranking-new.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const years = Array.from(
    { length: 2026 - 1980 + 1 },
    (_, i) => 1980 + i
  );

  const movieUrls: MetadataRoute.Sitemap = [];

  for (const year of years) {
    try {
      const data = await import(`./data/movies/${year}.json`);

      const movies = Array.isArray(data.default)
        ? data.default
        : Array.isArray(data.default?.movies)
        ? data.default.movies
        : [];

      for (const movie of movies) {
        if (!movie.id) continue;

        movieUrls.push({
          url: `${BASE_URL}/movies/${movie.id}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        });
      }
    } catch (error) {
      console.error(`Sitemap error: ${year}`, error);
    }
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...movieUrls,
  ];
}