// pages/api/stream-projects.js
import axios from "axios";
import cheerio from "cheerio";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fallbackGeocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search`;
    const resp = await axios.get(url, {
      params: { q: query, format: "json", addressdetails: 1, limit: 1 },
      headers: { "User-Agent": "MagicBricksScraper/1.0" }
    });

    const d = resp.data?.[0];
    if (d?.lat && d?.lon) {
      return { latitude: parseFloat(d.lat), longitude: parseFloat(d.lon) };
    }
  } catch (err) {
    console.error("Nominatim error:", err?.message);
  }
  return null;
}


async function geocode(query) {
    console.log("PositionStack key:", process.env.NEXT_PUBLIC_POSITIONSTACK_KEY);

  const key = process.env.NEXT_PUBLIC_POSITIONSTACK_KEY;
  console.log('aaaaaaaa',key)
  if (!key) return null;

  try {
    const resp = await axios.get("https://api.positionstack.com/v1/forward", {
  params: {
    access_key: key,
    query,
    country: "India",
    limit: 1,
  },
  timeout: 10000,
});

console.log(resp)
    const d = resp.data?.data?.[0];
    if (d?.latitude && d?.longitude) {
      return { latitude: d.latitude, longitude: d.longitude };
    }
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn("Rate limit hit, using Nominatim fallback...");
      return await fallbackGeocode(query);
    }
      if (err.response?.status === 422) {
    console.warn(`422 for query: "${query}", trying Nominatim fallback...`);
    return await fallbackGeocode(query);
  }
    console.error("Geocode error", err?.message || err);
  }

  return null;
}

export default async function handler(req, res) {
  const city = (req.query.city || "").trim();
  if (!city) {
    return res
      .status(400)
      .json({ error: "Missing city query param, e.g. ?city=Hyderabad" });
  }

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const sendEvent = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  const targetUrl = `https://www.magicbricks.com/new-projects-${encodeURIComponent(
    city
  )}`;
  let scrapedProjects = [];

  try {
    const { data: html } = await axios.get(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ScraperBot/1.0)" },
      timeout: 12000,
    });

    const $ = cheerio.load(html);

    // selectors may change, these are heuristics
    const candidateSelectors = [
      ".mb-proj-card",
      ".projectCard",
      ".new-project-card",
      ".project-card",
      ".mb-project-card",
      ".mbListing",
      ".listing",
    ];

    let nodes = $();
    for (const s of candidateSelectors) {
      const found = $(s);
      if (found.length) {
        nodes = found;
        break;
      }
    }

    nodes.each((i, el) => {
      const el$ = $(el);
      const name =
        el$.find("h2, .projectName, .title").first().text().trim() ||
        el$.find(".mb-project-title").text().trim();
      const location =
        el$
          .find(".location, .projectLocation, .locality")
          .first()
          .text()
          .trim() || el$.find(".mb-project-location").text().trim();
      const price =
        el$.find(".price, .priceRange").first().text().trim() || "N/A";
      const builder =
        el$.find(".builderName, .builder, .developer").first().text().trim() ||
        "N/A";

      if (name) {
        scrapedProjects.push({
          name,
          location: location || city,
          priceRange: price,
          builder,
        });
      }
    });
  } catch (err) {
    console.warn(
      "Scrape failed (using mock data):",
      err?.message || err.toString()
    );
  }

  // fallback mock projects
  if (!scrapedProjects.length) {
    scrapedProjects = [
      {
        name: `River View Heights`,
        location: `Kukatpally, ${city}`,
        priceRange: "₹50L - ₹1.2Cr",
        builder: "Sample Builder Pvt Ltd",
      },
      {
        name: `Skyline Residency`,
        location: `Banjara Hills, ${city}`,
        priceRange: "₹80L - ₹2Cr",
        builder: "Sunrise Constructions",
      },
      {
        name: `Greenwood Park`,
        location: `Gachibowli, ${city}`,
        priceRange: "₹30L - ₹70L",
        builder: "Green Homes Ltd",
      },
    ];
  }

  const seen = new Set();
  for (let i = 0; i < scrapedProjects.length; i++) {
    const proj = scrapedProjects[i];
    const key = `${proj.name}||${proj.location}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Geocode
    let coords = null;
    const geocodeQueries = [
      `${proj.location}, ${city}, India`,
      `${proj.name}, ${proj.location}, ${city}, India`,
    ];

    for (const q of geocodeQueries) {
      coords = await geocode(q);
      if (coords) break;
    }

    // fallback → city center if geocoding fails
    if (!coords) {
      coords = await geocode(`${city}, India`);
    }

    const projectWithCoords = {
      ...proj,
      latitude: coords?.latitude || null,
      longitude: coords?.longitude || null,
    };

    sendEvent({ type: "project", project: projectWithCoords });

    await sleep(400);
  }

  res.write(`event: done\ndata: {}\n\n`);
  res.end();
}
