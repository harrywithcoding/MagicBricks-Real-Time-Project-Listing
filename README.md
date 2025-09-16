# Real Estate Projects Explorer

A **Next.js 13+ real estate project viewer** inspired by MagicBricks.  
It fetches and displays real estate projects for a selected city in real-time, with project details and map integration.

---

## Features

- Dynamic city routing: `/city/[cityName]`
- Real-time project data streaming using **Server-Sent Events (SSE)**
- Project details include:
  - Project Name
  - Location
  - Price Range
  - Builder Name
  - Coordinates (latitude & longitude)
  - Project Image (dummy or real)
- Interactive project list with hover effects
- Map view integration using project coordinates
- Clean, responsive UI inspired by MagicBricks

---


## Tech Stack

- **Frontend:** React 18, Next.js 13 (App Router)  
- **State Management:** Zustand (`useProjectsStore`)  
- **Styling:** Inline CSS, MagicBricks-inspired UI  
- **API Integration:** Server-Sent Events for real-time updates  
- **Map Integration:** Google Maps / Leaflet (MapView component)  
- **Local Assets:** Dummy project images in `public/assets` folder  

---

## Project Structure

