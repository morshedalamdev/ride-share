# Rove

Rove is a frontend-only ride-sharing demo built with Next.js App Router, React, TypeScript, and Tailwind CSS. Rider and driver workspaces run independently with example trips in San Francisco. The map, route previews, vehicle images, and font ship with the app.

## Run locally

Use Node.js 20.9 or newer. From the repository root:

```sh
cd web
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Switch between **Rider** and **Driver** in the header. Complete a demo trip in either workspace to see it in that role’s Activity tab. New trip history is saved in this browser.

## Project structure

| Directory               | Responsibility                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `src/app`               | Page routes, metadata, shared layout, and Tailwind theme                                 |
| `src/components/layout` | Navigation and workspace headings                                                        |
| `src/features/booking`  | Route inputs, vehicle comparison, matching, and simulated checkout                       |
| `src/features/driver`   | Vehicle selection, availability, and request lifecycle                                   |
| `src/features/activity` | Trip lists, status filters, details, and rebooking                                       |
| `src/features/map`      | Interactive map, camera controls, landmarks, and bundled route geometry                  |
| `src/features/rides`    | Shared types, example places and vehicles, fare estimates, rider draft, and trip storage |
| `public`                | Vehicle renders and local San Francisco map artwork                                      |

For a future Go integration, start with the data inputs in `features/rides`. Route previews and fares currently come from local calculations and precomputed paths. The booking dialog and driver workspace advance trip status locally, and `useTripHistory` saves the result. Those are the integration points for routing, pricing, dispatch events, and trip history.

## Check and build

```sh
npm run lint
npm run typecheck
npm run build
```

The build creates a static site in `out/`. Serve that directory with any static web host. To preview the export locally with Python:

```sh
python3 -m http.server 4173 --directory out
```

Map geometry comes from the City and County of San Francisco via DataSF. Dataset links are embedded in `public/maps/san-francisco.svg`.
