import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import { fetchFromTMDB, isTmdbConfigured } from "./tmdb.service.js";
import { MORE_FREE_MOVIES } from "./freeMovies.more.js";

/**
 * Films and series that can legally be streamed in full, hosted by the Internet Archive.
 *
 * Every entry is either in the US public domain or released by its makers under a
 * Creative Commons licence. To add a title, add its archive.org identifier (the last
 * part of https://archive.org/details/<id>) together with the exact title and release
 * year TMDB uses, so it can be matched to its TMDB entry. If TMDB lists a different
 * year than the real release, put TMDB's year in `tmdbYear`.
 * Only add titles you have confirmed are public domain or openly licensed.
 * Mark short films with `short: true` so they are listed separately from features.
 */
export const FREE_MOVIES = [
  // --- Creative Commons / open films, newest first ---
  {
    archiveId: "charge-blender-open-movie-1608p",
    short: true,
    title: "Charge",
    year: 2022,
    license: "CC BY 4.0 (Blender Studio)",
    overview: "A lone, worn-out soldier breaks into a guarded facility to steal a battery. An open action short from Blender Studio.",
  },
  {
    archiveId: "sprite-fright",
    short: true,
    title: "Sprite Fright",
    year: 2021,
    tmdbYear: 2024,
    license: "CC BY 4.0 (Blender Studio)",
    overview: "A group of rowdy teenagers on a forest trip meet peaceful mushroom creatures that turn out to be a force of nature. An open horror-comedy short from Blender Studio.",
  },
  {
    archiveId: "coffee-run",
    short: true,
    title: "Coffee Run",
    year: 2020,
    license: "CC BY 4.0 (Blender Studio)",
    overview: "Fuelled by caffeine, a young woman runs through the bittersweet memories of a past relationship. An open animated short from Blender Studio.",
  },
  {
    archiveId: "spring_blenderopenmovie",
    short: true,
    title: "Spring",
    year: 2019,
    license: "CC BY 4.0 (Blender Studio)",
    overview: "A shepherd girl and her dog face ancient spirits in order to continue the cycle of life. An open animated short from Blender Studio.",
  },
  {
    archiveId: "agent327operationbarbershop",
    short: true,
    title: "Agent 327: Operation Barbershop",
    year: 2017,
    license: "CC BY-ND 4.0 (Blender Studio)",
    overview: "Secret agent Hendrik IJzerbroot investigates a suspicious barbershop in Amsterdam. An open animated short from Blender Studio.",
  },
  {
    archiveId: "CaminandesLlamigos",
    short: true,
    title: "Caminandes: Llamigos",
    year: 2016,
    license: "CC BY 3.0 (Blender Foundation)",
    overview: "Koro the llama fights a stubborn penguin over the last berries of the Patagonian winter. An open animated short.",
  },
  {
    archiveId: "CosmosLaundromatFirstCycle",
    short: true,
    title: "Cosmos Laundromat",
    year: 2015,
    license: "CC BY 4.0 (Blender Foundation)",
    overview: "On a desolate island, a suicidal sheep named Franck meets a mysterious salesman who offers him the gift of a lifetime. An open animated short.",
  },
  {
    archiveId: "Tears-of-Steel",
    short: true,
    title: "Tears of Steel",
    year: 2012,
    license: "CC BY 3.0 (Blender Foundation)",
    overview: "A group of warriors and scientists try to save the world from destructive robots. An open sci-fi short from the Blender Foundation.",
  },
  {
    archiveId: "valkaama",
    category: "modern",
    title: "Valkaama",
    year: 2010,
    license: "CC BY-SA",
    overview: "Two young men travel north through Finland towards the remote Valkaama, each running from his own past. An independent open-source feature film.",
  },
  {
    archiveId: "Sintel",
    short: true,
    title: "Sintel",
    year: 2010,
    license: "CC BY 3.0 (Blender Foundation)",
    overview: "A lone girl searches the world for the baby dragon she once rescued. An open animated short from the Blender Foundation.",
  },
  {
    archiveId: "Sita_Sings_the_Blues",
    category: "modern",
    title: "Sita Sings the Blues",
    year: 2008,
    license: "CC0 (dedicated to the public domain by Nina Paley)",
    overview: "The Indian epic Ramayana is retold alongside the filmmaker's own break-up, set to 1920s jazz recordings by Annette Hanshaw. An animated feature.",
  },
  {
    archiveId: "BigBuckBunny_124",
    short: true,
    title: "Big Buck Bunny",
    year: 2008,
    license: "CC BY 3.0 (Blender Foundation)",
    overview: "A gentle giant rabbit takes comic revenge on three bullying rodents. An open animated short from the Blender Foundation.",
  },
  {
    archiveId: "ElephantsDream",
    short: true,
    title: "Elephants Dream",
    year: 2006,
    license: "CC BY (Blender Foundation)",
    overview: "Two men explore a strange, endless machine. The first open animated short from the Blender Foundation.",
  },
  {
    archiveId: "StarWreckInThePirkining",
    category: "modern",
    title: "Star Wreck: In the Pirkinning",
    year: 2005,
    license: "Creative Commons (released free by its makers)",
    overview: "Stranded on present-day Earth, Captain Pirk builds a fleet and sets out to conquer the galaxy in this Finnish sci-fi parody feature.",
  },

  // --- Public-domain classics ---
  {
    archiveId: "Night.Of.The.Living.Dead_1080p",
    category: "horror",
    title: "Night of the Living Dead",
    year: 1968,
    license: "Public domain",
    overview: "A group of strangers barricade themselves in a farmhouse as the recently dead rise and attack the living. George A. Romero's landmark horror film.",
  },
  {
    archiveId: "TheLastManOnEarth_72",
    category: "horror",
    title: "The Last Man on Earth",
    year: 1964,
    license: "Public domain",
    overview: "Vincent Price plays the sole survivor of a plague that has turned everyone else into vampire-like creatures.",
  },
  {
    archiveId: "mclintok_widescreen",
    category: "western",
    title: "McLintock!",
    year: 1963,
    license: "Public domain",
    overview: "A wealthy cattle baron's life is turned upside down when his estranged wife returns to town. A comedy western with John Wayne and Maureen O'Hara.",
  },
  {
    archiveId: "carnival_of_souls",
    category: "horror",
    title: "Carnival of Souls",
    year: 1962,
    license: "Public domain",
    overview: "After surviving a car accident, a church organist is drawn to an abandoned carnival and haunted by a ghostly figure.",
  },
  {
    archiveId: "The_Little_Shop_of_Horrors.mpeg",
    category: "horror",
    title: "The Little Shop of Horrors",
    year: 1960,
    license: "Public domain",
    overview: "A clumsy florist's assistant grows a plant that craves human blood. Roger Corman's cult horror comedy.",
  },
  {
    archiveId: "house_on_haunted_hill_ipod",
    category: "horror",
    title: "House on Haunted Hill",
    year: 1959,
    license: "Public domain",
    overview: "An eccentric millionaire offers five strangers a fortune if they can survive one night in a haunted mansion.",
  },
  {
    archiveId: "suddenly",
    category: "noir",
    title: "Suddenly",
    year: 1954,
    license: "Public domain",
    overview: "Hired killers take over a family home in a small town to ambush the President as his train passes through.",
  },
  {
    archiveId: "kansascityconfidencial",
    category: "noir",
    title: "Kansas City Confidential",
    year: 1952,
    license: "Public domain",
    overview: "An ex-convict framed for an armoured-car robbery tracks the masked gang down to Mexico to clear his name.",
  },
  {
    archiveId: "doa_ipod",
    category: "noir",
    title: "D.O.A.",
    year: 1950,
    license: "Public domain",
    overview: "A man who has been fatally poisoned has only hours left to find out who killed him, and why.",
  },
  {
    archiveId: "TheStranger_0",
    category: "noir",
    title: "The Stranger",
    year: 1946,
    license: "Public domain",
    overview: "An investigator tracks a fugitive war criminal hiding under a new identity in a quiet Connecticut town.",
  },
  {
    archiveId: "ScarletStreet",
    category: "noir",
    title: "Scarlet Street",
    year: 1945,
    license: "Public domain",
    overview: "A lonely cashier and amateur painter falls for a woman who, with her boyfriend, sets out to swindle him. Film noir by Fritz Lang.",
  },
  {
    archiveId: "Detour",
    category: "noir",
    title: "Detour",
    year: 1945,
    license: "Public domain",
    overview: "A hitchhiking pianist's trip to Los Angeles turns into a nightmare in this low-budget film noir classic.",
  },
  {
    archiveId: "his_girl_friday",
    category: "comedy",
    title: "His Girl Friday",
    year: 1940,
    license: "Public domain",
    overview: "A newspaper editor uses every trick he knows to keep his star reporter, who is also his ex-wife, from remarrying.",
  },
  {
    archiveId: "MyManGodfrey1936",
    category: "comedy",
    title: "My Man Godfrey",
    year: 1936,
    license: "Public domain",
    overview: "A scatterbrained socialite hires a homeless man as the family butler, with unexpected results. A screwball comedy classic.",
  },
  {
    archiveId: "TheGeneral",
    category: "silent",
    title: "The General",
    year: 1926,
    license: "Public domain",
    overview: "Buster Keaton's silent comedy about a train engineer who chases his stolen locomotive across enemy lines.",
  },
];

/**
 * Series work the same way. `archiveIds` lists the archive.org items holding the
 * episodes: either one item per episode, or one item containing many episode files.
 * `partial` marks shows where only some episodes are free (the public-domain ones).
 */
export const FREE_SERIES = [
  {
    archiveIds: [
      "pioneer-one-ep.-1-earthfall-pilot",
      "pioneer-one-ep.-2-the-man-from-mars_202608",
      "pioneer-one-ep.-3-alone-in-the-night",
      "pioneer-one-ep.-4-triangular-diploma",
      "pioneer-one-ep.-5-sea-change",
      "pioneer-one-ep.-6-war-of-the-world-3mp-4_202608",
    ],
    title: "Pioneer One",
    year: 2010,
    license: "Creative Commons (released free by its makers)",
    overview: "An object falls from the sky over Montana, and investigators find a Soviet spacecraft carrying a young man who may have been born on Mars. A crowd-funded sci-fi drama series.",
  },
  {
    archiveIds: ["bevhill-s01e01-36"],
    title: "The Beverly Hillbillies",
    year: 1962,
    license: "Public domain (early episodes)",
    partial: true,
    overview: "A poor mountain family strikes oil and moves to a mansion in Beverly Hills, to the confusion of everyone around them. Classic sitcom.",
  },
  {
    archiveIds: ["Bonanza_pd"],
    title: "Bonanza",
    year: 1959,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "The adventures of Ben Cartwright and his three sons on the Ponderosa ranch in Nevada. Classic western series.",
  },
  {
    archiveIds: ["superman-fleischer-brothers-animated-series-1941-1943"],
    title: "Superman",
    year: 1941,
    license: "Public domain",
    overview: "The classic Fleischer Studios animated shorts: Superman battles mad scientists, giant robots and saboteurs in Metropolis.",
  },
  {
    archiveIds: ["SherlockHolmes1954"],
    title: "Sherlock Holmes",
    year: 1954,
    license: "Public domain",
    overview: "Ronald Howard plays a young Sherlock Holmes solving cases in Victorian London with Dr. Watson. All 39 episodes.",
  },
  {
    archiveIds: ["manwithacamera_202002"],
    title: "Man with a Camera",
    year: 1958,
    license: "Public domain",
    overview: "Charles Bronson stars as a former combat photographer who takes on dangerous assignments the police and newspapers can't handle.",
  },
  {
    archiveIds: ["one-step-beyond-collection"],
    title: "One Step Beyond",
    year: 1959,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "An anthology of dramatised stories about the supernatural and the unexplained, each presented as a true account.",
  },
  {
    archiveIds: ["Suspense_201705"],
    title: "Suspense",
    year: 1949,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "A live anthology of thrillers and mysteries from the early days of television.",
  },
  {
    archiveIds: ["FourStarPlayhouse-48Episodes"],
    title: "Four Star Playhouse",
    year: 1952,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "An anthology series in which four film stars, including David Niven and Dick Powell, take turns playing the lead in a new story each week.",
  },
  {
    archiveIds: ["theloneranger_201705"],
    title: "The Lone Ranger",
    year: 1949,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "A masked former Texas Ranger and his companion Tonto fight outlaws in the Old West.",
  },
  {
    archiveIds: ["annieoakleys01"],
    title: "Annie Oakley",
    year: 1954,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "Sharpshooter Annie Oakley keeps the peace in the town of Diablo with her brother Tagg and deputy Lofty Craig.",
  },
  {
    archiveIds: ["theadventuresofkitcarson"],
    title: "The Adventures of Kit Carson",
    year: 1951,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "Frontier scout Kit Carson and his Mexican sidekick El Toro ride the Old West righting wrongs.",
  },
  {
    archiveIds: ["s01e16buffalobilljr.graveofthemonsters"],
    title: "Buffalo Bill, Jr.",
    year: 1955,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "An orphan raised by a judge becomes marshal of Wileyville, Texas, with his little sister Calamity.",
  },
  {
    archiveIds: ["petticoatjunction_20170809"],
    title: "Petticoat Junction",
    year: 1963,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "Kate Bradley runs the Shady Rest Hotel with her three daughters and lazy Uncle Joe. Classic rural sitcom.",
  },
  {
    archiveIds: ["the.dick.van.dyke.show.s02e04"],
    title: "The Dick Van Dyke Show",
    year: 1961,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "The work and home life of TV comedy writer Rob Petrie and his wife Laura. Classic sitcom.",
  },
  {
    archiveIds: ["colonelbleep_s1"],
    title: "Colonel Bleep",
    year: 1957,
    license: "Public domain",
    overview: "An alien from the planet Futura protects Earth with a puppet and a caveman. The first colour cartoon series made for television.",
  },
  {
    archiveIds: ["thenew3stoogestv"],
    title: "The New 3 Stooges",
    year: 1965,
    license: "Public domain (selected episodes)",
    partial: true,
    overview: "Animated adventures of Moe, Larry and Curly Joe, with live-action segments by the Stooges themselves.",
  },
];

// The long list of additional public-domain features lives in its own file
FREE_MOVIES.push(...MORE_FREE_MOVIES);

const CATALOGS = { movie: FREE_MOVIES, tv: FREE_SERIES };

// Genre rows for the free films (the `category` field of an entry)
export const FREE_CATEGORIES = ["horror", "noir", "comedy", "western", "silent", "modern"];

// Flags added to every free catalog item so the UI can label and group it
const freeFlags = (entry) => ({ free: true, short: Boolean(entry.short), category: entry.category || null });

// Without a TMDB key the free titles have no TMDB id, so they get stable negative
// ids which can never collide with a real TMDB id: films -1, -2, ...; series -1001, -1002, ...
const LOCAL_ID_OFFSET = { movie: 0, tv: 1000 };

const normalizeTitle = (title = "") => title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const firstArchiveId = (entry) => entry.archiveId || entry.archiveIds[0];

/** Find the catalog entry for a TMDB title. Year may differ by one between sources. */
export const findFreeTitle = (type, title, year) => {
  const wanted = normalizeTitle(title);
  if (!wanted || !year) return null;
  return (
    CATALOGS[type].find(
      (entry) =>
        normalizeTitle(entry.title) === wanted && Math.abs((entry.tmdbYear || entry.year) - Number(year)) <= 1
    ) || null
  );
};

export const getFreeTitleByLocalId = (type, id) => CATALOGS[type][-Number(id) - LOCAL_ID_OFFSET[type] - 1] || null;

const toLocalItem = (type, entry) => ({
  id: -(CATALOGS[type].indexOf(entry) + LOCAL_ID_OFFSET[type] + 1),
  [type === "tv" ? "name" : "title"]: entry.title,
  overview: entry.overview,
  poster_path: `https://archive.org/services/img/${firstArchiveId(entry)}`,
  backdrop_path: null,
  [type === "tv" ? "first_air_date" : "release_date"]: String(entry.year),
  vote_average: 0,
  media_type: type,
  ...freeFlags(entry),
});

export const getLocalFreeItem = (type, id) => {
  const entry = getFreeTitleByLocalId(type, id);
  return entry ? toLocalItem(type, entry) : null;
};

const LIST_TTL_MS = 6 * 60 * 60 * 1000;
const listCache = {};

/** The free titles as catalog items: real TMDB entries when a key is set, local ones otherwise. */
export const getFreeItems = async (type) => {
  const catalog = CATALOGS[type];
  if (!isTmdbConfigured()) return catalog.map((entry) => toLocalItem(type, entry));
  if (listCache[type] && Date.now() - listCache[type].at < LIST_TTL_MS) return listCache[type].items;

  const lookUp = async (entry) => {
      try {
        const data = await fetchFromTMDB(`/search/${type}`, { query: entry.title, include_adult: false });
        const match = (data.results || []).find(
          (result) =>
            findFreeTitle(
              type,
              result.title || result.name,
              (result.release_date || result.first_air_date)?.substring(0, 4)
            ) === entry
        );
        if (match) return { ...match, media_type: type, ...freeFlags(entry) };
      } catch (error) {
        console.warn(`Could not look up "${entry.title}" on TMDB:`, error.message);
      }
      return toLocalItem(type, entry);
  };

  // Look titles up in small batches to stay well inside TMDB's rate limit
  const items = [];
  for (let start = 0; start < catalog.length; start += 10) {
    items.push(...(await Promise.all(catalog.slice(start, start + 10).map(lookUp))));
  }

  listCache[type] = { at: Date.now(), items };
  return items;
};

// ---------------------------------------------------------------------------
// Resolving the actual video files. File lists are read from the Internet
// Archive's metadata API rather than hardcoded, so URLs are never guessed.
// ---------------------------------------------------------------------------

// An item's file list practically never changes, so it is remembered on disk. After the
// first lookup the site doesn't need to ask the Archive's metadata API again, which keeps
// things working (and fast) when that API is slow, down, or rate-limiting us.
const CACHE_FILE = fileURLToPath(new URL("../.cache/archive-metadata.json", import.meta.url));

const loadMetadataCache = () => {
  try {
    return new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"))));
  } catch {
    return new Map(); // no cache yet
  }
};

const metadataCache = loadMetadataCache();

const saveMetadataCache = () => {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(Object.fromEntries(metadataCache)));
  } catch (error) {
    console.warn("Could not save the archive metadata cache:", error.message);
  }
};

const getArchiveMetadata = async (archiveId) => {
  if (metadataCache.has(archiveId)) return metadataCache.get(archiveId);
  const { data } = await axios.get(`https://archive.org/metadata/${archiveId}`, { timeout: 25000 });
  if (!data?.files) throw new Error(`archive.org returned no file list for "${archiveId}"`);

  // Keep only what the site uses: the item title and its MP4 files
  const trimmed = {
    metadata: { title: data.metadata?.title },
    files: data.files
      .filter((file) => /\.mp4$/i.test(file.name))
      .map(({ name, format, source, size, length, title }) => ({ name, format, source, size, length, title })),
  };
  metadataCache.set(archiveId, trimmed);
  saveMetadataCache();
  return trimmed;
};

const getMp4Files = (metadata) =>
  (metadata.files || [])
    .filter((file) => /\.mp4$/i.test(file.name) && !/sample/i.test(file.name))
    .sort((a, b) => Number(b.size || 0) - Number(a.size || 0));

// Prefer the Archive's own web derivatives: they are always H.264/AAC, which every
// browser plays. Original uploads can use codecs browsers don't support.
const pickBestFile = (mp4s) =>
  mp4s.find((file) => file.format === "h.264") || mp4s.find((file) => file.source === "derivative") || mp4s[0];

const toDownloadUrl = (archiveId, fileName) =>
  `https://archive.org/download/${archiveId}/${fileName.split("/").map(encodeURIComponent).join("/")}`;

// The Archive reports a file's length either in seconds ("5567.23") or as "1:32:47"
const toMinutes = (length) => {
  if (!length) return null;
  const seconds = String(length)
    .split(":")
    .reduce((total, part) => total * 60 + Number(part), 0);
  return Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds / 60) : null;
};

export const resolveArchiveSource = async (movie) => {
  const file = pickBestFile(getMp4Files(await getArchiveMetadata(movie.archiveId)));
  if (!file) throw new Error(`No MP4 file found for archive.org item "${movie.archiveId}"`);

  return {
    url: toDownloadUrl(movie.archiveId, file.name),
    runtimeMinutes: toMinutes(file.length),
    short: Boolean(movie.short),
    provider: "Internet Archive",
    pageUrl: `https://archive.org/details/${movie.archiveId}`,
    license: movie.license,
  };
};

// Ways archive.org uploaders number their episode files, most specific first
const EPISODE_PATTERNS = [
  /s(\d{1,2})\s*e(\d{1,3})/i, // "s01e06_Trick_Or_Treat", "S01 E06"
  /ep(?:isode)?\.?[\s_-]*(\d{1,3})/i, // "Ep. 3 Alone In The Night"
  /\bE(\d{1,3})\b/, // "Superman E01 - The Mad Scientist"
  /^\D*?\b(\d{1,3})\b(?=\s)/, // "Sherlock Holmes 01 The Case of ..."
];

const matchEpisode = (text) => {
  for (const pattern of EPISODE_PATTERNS) {
    const match = pattern.exec(text);
    if (match) return match;
  }
  return null;
};

const baseName = (text) => text.split("/").pop().replace(/(\.ia)?\.mp4$/i, "");

const parseEpisodeNumber = (text) => {
  const match = matchEpisode(baseName(text));
  if (!match) return null;
  return match.length === 3
    ? { season: Number(match[1]), episode: Number(match[2]) }
    : { season: 1, episode: Number(match[1]) };
};

// Whatever follows the episode number is the episode title
const parseEpisodeTitle = (text, seriesTitle = "") => {
  const name = baseName(text);
  const match = matchEpisode(name);
  const title = (match ? name.slice(match.index + match[0].length) : name)
    .replace(/\[[^\]]*\]|\(\d{4}\)/g, "") // "[360p]", "(1941)"
    .replace(/[\s_-](360|480|720|1080)p?$/i, "") // trailing resolution tag
    .replace(new RegExp(`^[\\s_.-]*${seriesTitle.replace(/[^a-z0-9]+/gi, "[^a-z0-9]*")}(?:[\\s_.-]+|$)`, "i"), "") // repeated show name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  // "TREASURE MAP" -> "Treasure Map"
  return title === title.toUpperCase() ? title.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : title;
};

/** All playable episodes of a free series, in order. */
export const resolveSeriesEpisodes = async (series) => {
  const perItem = await Promise.allSettled(
    series.archiveIds.map(async (archiveId, index) => {
      const metadata = await getArchiveMetadata(archiveId);
      const mp4s = getMp4Files(metadata);

      // Group the files by episode number (an episode can exist in several encodings)
      const byEpisode = new Map();
      for (const file of mp4s) {
        const number = parseEpisodeNumber(file.name);
        if (!number) continue;
        const key = `${number.season}-${number.episode}`;
        byEpisode.set(key, [...(byEpisode.get(key) || []), file]);
      }

      // One item holding many episodes
      if (byEpisode.size > 1) {
        return [...byEpisode.values()].map((files) => {
          const file = pickBestFile(files);
          return {
            ...parseEpisodeNumber(file.name),
            title: parseEpisodeTitle(file.title || file.name, series.title),
            url: toDownloadUrl(archiveId, file.name),
          };
        });
      }

      // One item per episode
      const file = pickBestFile(mp4s);
      if (!file) return [];
      const label = metadata.metadata?.title || archiveId;
      return [
        {
          ...(parseEpisodeNumber(label) || { season: 1, episode: index + 1 }),
          title: parseEpisodeTitle(label, series.title),
          url: toDownloadUrl(archiveId, file.name),
        },
      ];
    })
  );

  // An item that couldn't be reached is skipped now and retried on the next request
  const episodes = perItem
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort((a, b) => a.season - b.season || a.episode - b.episode);

  return {
    provider: "Internet Archive",
    pageUrl: `https://archive.org/details/${series.archiveIds[0]}`,
    license: series.license,
    partial: Boolean(series.partial),
    episodes: episodes.map((episode) => ({ ...episode, title: episode.title || `Episode ${episode.episode}` })),
  };
};
