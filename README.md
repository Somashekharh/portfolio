# Portfolio 95

A static personal portfolio presented as a Windows 95 desktop. It uses plain HTML, CSS, and vanilla JavaScript. No packages, build step, or server side code are required.

## Run locally

Open `index.html` in a modern browser, or serve this folder over HTTP:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Serving over HTTP lets the PDF preview work consistently across browsers.

## Update portfolio content

Edit [`js/data.js`](js/data.js). It contains the profile, links, SEO text, education, experience, projects, repositories, skills, Oracle DBA topics, credentials, résumé path, and Recycle Bin samples. Keep dates, metrics, and URLs tied to a source you can verify. A project can omit its `github` property when it has no matching repository.

Use `js/apps.js` for desktop shortcuts, Start menu groups, window titles, icons, and default sizes. The application renderers and interactions live in `js/main.js`; shared window behavior is in `js/window-manager.js`; the simulated command prompt is in `js/terminal.js`.

The current `resume/resume.pdf` is a two-page summary assembled from the résumé details in the supplied brief and the public profile because no original résumé PDF was present in the available attachments. Replace it with the original file when available; keep the same path or update `personal.resume.file` in `js/data.js`.

## Desktop controls

- Open desktop shortcuts with a double-click, or a single click on touch screens. Use the Start menu to browse the same apps.
- Drag a title bar to move a window on desktop. Use the title bar buttons or taskbar buttons to minimize, restore, maximize, and close windows.
- Right-click the desktop for arrangement and display settings. Right-click a project to move it to the simulated Recycle Bin; restore it from there.
- Open **Display Properties** to change the desktop color, CRT scanlines, pixel texture, and optional UI sound. Preferences are saved in local browser storage.
- Open **MS-DOS Prompt** and enter `help` for supported portfolio commands. Commands are simulated and do not run on the host computer.
- The Shut Down menu closes or restarts this portfolio page; it does not shut down the computer.

## GitHub Pages

Publish the contents of this folder as the repository site root, then select the repository branch and `/ (root)` in the repository's Pages settings. All paths are relative, so the static site works both from a repository root and from a project subpath.

## Assets

SVG icons are in `assets/icons/`. Optional profile, project, and certificate images belong in their matching `assets/` folders. The interface does not require remote fonts, images, or JavaScript libraries.
