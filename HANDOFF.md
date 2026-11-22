# Portfolio maintenance

The site is plain HTML, CSS, and JavaScript in `portfolio/`. Vercel serves that directory using the repository’s `vercel.json`. Use the repository root as the Vercel project root.

## Preview and test

Install Node.js 20 or newer and Python 3, then run these commands from the repository root:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:8000. In a second terminal, run `npm test` for the browser checks or `npm test -- --headed` to watch them. The tests reuse the preview server when it is running. On macOS they use Brave if installed in Applications. Otherwise, install Chromium once with `npx playwright install chromium`, or set `BROWSER_EXECUTABLE` to the path of your browser.

## Update the site

- Edit `portfolio/data/projects.json` for project details and links. The home screen groups projects by `personal`, `open-source`, `research`, and `coursework`.
- Put app recordings in `portfolio/assets/videos/`, then connect them in `VIDEO_SOURCES` in `portfolio/script.js`. Camera, Spotify, and Canva show placeholders until their recordings are added.
- Update Contacts and Notes in `portfolio/script.js`. The resume link opens `portfolio/Shubhan_ML_Resume.pdf`.
- The brain tumor and fake news apps are hosted separately. Change their URLs in the project data when their hosting changes.

## Run the Parkinson’s notebook

Run `uv run --locked --with jupyterlab jupyter lab` from the repository root. Open `Basic/Parkinsons/model/model.ipynb` and run all cells with the Python kernel. The notebook uses `../data/parkinsons.data` relative to its own directory. It holds out entire people for evaluation and groups the training folds the same way. The last code cell regenerates `parkinsons_model.joblib`.
