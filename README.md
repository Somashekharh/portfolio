# Portfolio 95

A static personal portfolio presented as a Windows 95 desktop. It uses plain HTML, CSS, and vanilla JavaScript. No packages, build step, or server side code are required.

## Run locally

Open `index.html` in a modern browser, or serve this folder over HTTP:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Serving over HTTP lets the PDF preview work consistently across browsers.

## Update portfolio content

Edit [`js/data.js`](js/data.js). It contains the profile, links, SEO text, experience summary, education, employment history, project assignments, projects, repositories, skills, completed training, learning in progress, credentials, résumé path, and Recycle Bin samples. Keep dates, metrics, and URLs tied to a source you can verify. A project can omit its `github` property when it has no matching repository.

Project assignments are stored in `projectExperience`; the employer and virtual program records remain in `experience`. The supplied Alaska end date is labeled as scheduled. Skills marked **Basic** or **Learning** carry those labels in the Skills window; other skills do not use invented proficiency scores. Completed training is shown separately from learning in progress and from the existing credential list.

Use `js/apps.js` for desktop shortcuts, Start menu groups, window titles, icons, and default sizes. The application renderers and interactions live in `js/main.js`; shared window behavior is in `js/window-manager.js`; the simulated command prompt is in `js/terminal.js`.

The résumé viewer reads `resume/resume.pdf`, whose text content is exported from `resume.html`. The interactive résumé summaries read `js/data.js`; keep those portfolio records aligned when updating professional facts.

## ATS and accessible résumé

`resume.html` is the plain, semantic, single-column résumé for recruiters, screen readers, and applicant tracking systems. It is available at the site-root path `resume.html`, from the desktop and Start menu as **Text Resume**, and in the résumé viewer. `resume/resume.pdf` is exported from that HTML and contains the same content. When changing résumé facts, update `resume.html`, print it to an A4 PDF, and replace `resume/resume.pdf`; update `js/data.js` for the interactive Windows 95 portfolio views. The standalone page uses standard headings and lists, selectable text, no tables or columns, and print styles.

## Desktop controls

- Open desktop shortcuts with a double-click, or a single click on touch screens. Use the Start menu to browse the same apps.
- Drag a title bar to move a window on desktop. Use the title bar buttons or taskbar buttons to minimize, restore, maximize, and close windows.
- Right-click the desktop for arrangement and display settings. Right-click a project to move it to the simulated Recycle Bin; restore it from there.
- Open **Display Properties** to change the desktop color, CRT scanlines, pixel texture, and optional UI sound. Preferences are saved in local browser storage.
- Open **MS-DOS Prompt** and enter `help` for supported portfolio commands. Commands are simulated and do not run on the host computer.
- The Shut Down menu closes or restarts this portfolio page; it does not shut down the computer.

## GitHub Pages

This repository includes a GitHub Actions deployment workflow at `.github/workflows/static.yml`. In **Settings → Pages**, set the deployment source to **GitHub Actions**. The workflow publishes the repository root when changes are pushed to `main`, and it can also be run manually from the Actions tab. All asset paths are relative, so the site works as a project site as well as from a domain root. The canonical URL and profile links currently use `https://somashekharh.github.io/portfolio/`; update those if the repository URL changes.

## Assets

SVG icons are in `assets/icons/`. Optional profile, project, and certificate images belong in their matching `assets/` folders. The interface does not require remote fonts, images, or JavaScript libraries.
