# Miss-L-Gems: Project Instructions

## 1. About the project

- Miss-L-Gems is an educational website of interactive activities for secondary students.
- It has three collections: EAL, Mainstream Subjects and Other Activities.
- The owner and developer is a beginner in coding.
- The site is plain HTML with no build step.
- The site is published through GitHub and Vercel.

## 2. How to work with the owner

- Explain technical instructions in simple language, one step at a time.
- Inspect and explain before acting.
- Ask before any major change.
- Ask before any deletion, renaming or restructuring.
- Change only the files the task needs. Leave unrelated files unchanged.
- Do not redesign anything unless asked.
- After each change, list the files changed, explain what changed, and explain how to check it.

## 3. Folder structure

- `index.html` is the homepage.
- `eal/` holds English as an Additional Language activities.
- `mainstream/` holds subject-support activities.
- `activities/` holds form-time and free-time activities.
- `README.md` is a short project note. It is not shown on the site.

Live Map Detective pages:

- `eal/map-detective-live-host.html` is the teacher page of the live game.
- `eal/map-detective-live.html` is the student page of the live game.
- Both live pages stay off the public homepage for now.
- Keep both filenames and all of their features exactly as they are.
- Never rename `eal/map-detective-live.html`. The teacher page builds its QR code and join link from this filename.

## 4. Design standards

- The design must be professional, modern, clean and visually engaging.
- Avoid cheap-looking pastel designs, excessive playfulness and flashy gradients.
- Keep the gemstone identity of the site:
  - Emerald for EAL.
  - Sapphire for Mainstream Subjects.
  - Bronze for Other Activities.
  - Gold for accents.
  - Cormorant Garamond for headings and Jost for body text.
- Layouts must be responsive on desktop, tablet and mobile.
- Phone layouts must never scroll sideways.
- Use clear typography, readable font sizes, consistent spacing and intuitive navigation.

Accessibility:

- Colour contrast must be strong enough to read easily.
- All buttons and controls must work with a keyboard.
- Focus outlines must be visible.
- Animations must respect the "reduced motion" setting.
- Controls must have meaningful labels for screen readers.

## 5. Rules for activity pages

- Each activity is one self-contained HTML file.
- Preserve existing features and functionality when redesigning or editing an activity.
- Every activity keeps its Home button that links to `../index.html`.
- Every Home button keeps its "Leave this activity? Tap again" safeguard.
- File names use lowercase words joined by hyphens, for example `sentence-sorter.html`.
- Save, PDF and download features must also work outside Claude, falling back to a normal browser download.
- Progress saved in the browser (localStorage or sessionStorage) must be wrapped in try/catch and fail safely when the browser blocks storage.
- Avoid unnecessary duplication of code or content.
- Never leave broken links.

## 6. EAL teaching standards

- Align activities with the WIDA ELD Standards Framework: standard, key language use, domain, proficiency level and descriptor.
- Align activities with CEFR levels.
- Scaffold appropriately for each proficiency level:
  - Lower levels: word banks, sentence frames and model answers.
  - Higher levels: fewer supports and more independence.
- Content must be age-appropriate for secondary students, with a mature tone that is not childish.

WIDA details:

- EAL activities: required.
- Mainstream Subjects activities: required.
- Other Activities: optional.

CEFR level:

- EAL activities: required, including on the homepage entry.
- Mainstream Subjects activities: optional, included only when relevant.
- Other Activities: optional, included only when relevant.

## 7. Anti-cheating requirements

Copying, selection and translation:

- Discourage browser translation (for example `translate="no"` and the `notranslate` meta tag).
- Block ordinary copy, cut and paste keyboard shortcuts where appropriate.
- Block copy, cut and paste clipboard events where appropriate.
- Disable right-click where appropriate.
- Disable ordinary text selection where appropriate.
- Always preserve:
  - Legitimate typing in answer boxes.
  - Accessibility tools.
  - The activity's own Copy and Export buttons.

Tab-switch detection (three stages):

1. First departure: show a warning only. Keep all answers and progress.
2. Second departure: reset only the section or part the student was working on when they left. Keep completed work in all other sections.
3. Third departure: reset the entire activity and clear all answers and progress.

Departure counting rules:

- Count departures within the same attempt.
- A page reload does not reset the departure count and does not start a new attempt. Store the count so it survives a reload.
- A genuinely new attempt resets the departure count to zero.
- In a one-section activity, the second and third departures both reset the whole activity.
- Before any reset, tell the student clearly what is being reset and why.

Randomisation:

- Randomise question order for every new attempt.
- Randomise answer-choice order for every new attempt.
- After shuffling, correct-answer matching, scoring, feedback and answer review must stay accurate.

Limits and fairness:

- Never record the time a student spends on individual questions.
- Anti-cheating measures are deterrents, not guarantees. Explain this clearly to the owner.

## 8. Feedback, scoring and export

- Give accurate feedback.
- Provide an answer review.
- Score accurately.
- Where appropriate, offer student response export as PDF or copy.
- Exports show the student's name, class and answers.

## 9. Adding a new activity to the homepage

Steps:

1. Put the activity file in the correct folder.
2. Open the matching collection section of `index.html` (`#eal`, `#mainstream` or `#other`).
3. Copy an existing activity entry (`<li class="item">`) in that section.
4. Change the copied entry's details to match the new activity.
5. Point the Play or Start button to the new file.
6. Preview the homepage locally.
7. Click the button to confirm the new activity opens.
8. Click the activity's Home button to confirm it returns to the homepage.

Homepage entry checklist:

- Activity name.
- Level: year group, unit or chapter.
- Skill focus.
- Topic focus.
- WIDA focus, following Section 6.
- WIDA descriptor, following Section 6.
- CEFR level, following Section 6.
- Play or Start button linking to the correct file.

## 10. Previewing and checking

How to preview:

- Quick look: double-click `index.html`.
- Recommended: in the project folder, run `python3 -m http.server 8000`, then open `http://localhost:8000`. Press Ctrl+C to stop it.
- An internet connection is needed for the fonts and for the live Map Detective game.

Checklist before a change is finished:

- All links work.
- The Home button works.
- The layout works on phone, tablet and desktop sizes.
- Question shuffling and answer-choice shuffling work.
- Scoring, feedback and answer review are correct.
- All three tab-switch stages behave as intended.
- The departure count survives a page reload.
- Export works.
- No unrelated files changed.

## 11. Git version control

What Git is:

- Git saves snapshots of the project, so mistakes can be undone and earlier versions restored.

Permission rules:

- Never run `git init` without asking the owner first.
- Never change Git settings without asking the owner first.
- Save snapshots (commits) only when the owner asks.

Setup steps, done one at a time with approval:

1. Start Git in the project folder.
2. Add a `.gitignore` file so Git ignores `.DS_Store`, a Mac system file.
3. Save the first snapshot of the project.
4. Create a project (repository) on GitHub.
5. Connect the local project to the GitHub project.
6. Upload the first snapshot to GitHub.

Safe habits:

- Save a snapshot before each change.
- Write a clear description for each snapshot.
- Try bigger changes on a separate branch first. A branch is a copy of the project for experimenting safely.
- Merge a branch into the main version only after checking it.

## 12. Publishing with GitHub and Vercel

How it works:

- Vercel is connected to the GitHub project.
- When changes reach the main branch, Vercel updates the live site automatically.
- When changes reach another branch, Vercel creates a private preview link.
- No build settings are needed. `index.html` is at the top of the project, so Vercel serves it as the homepage.

Safe publishing workflow:

1. Make the change locally.
2. Preview and check it locally using Section 10.
3. Save a snapshot with Git.
4. Upload the snapshot to a separate branch on GitHub.
5. Open the Vercel preview link for that branch.
6. Check the preview on a phone and on a computer.
7. Merge the branch into the main branch.
8. Wait for Vercel to update the live site.
9. Check the live site.

Undoing a bad release:

- Option 1: roll back to an earlier deployment in the Vercel dashboard.
- Option 2: reverse the snapshot in Git and upload again.

Permission rules:

- Never upload to GitHub without the owner's clear approval.
- Never merge into the main branch without the owner's clear approval.
- Never publish the site without the owner's clear approval.

After the site is online:

- Check that the live Map Detective QR code opens the student page.

## 13. Known limits and open issues

- The live Map Detective game needs the internet and only works on the published site.
- PDF saving in The Courtesy Book only works inside Claude. Elsewhere it asks students to use the Copy button.
- The Maths Word Lab tab title still includes a date: "November 4, 2026".
- `index.html` has a duplicate styling rule for the footer link (`footer .teacher`).
- Homepage EAL entries do not show CEFR levels yet, but now require them.
- Existing activities still need checking against the anti-cheating, three-stage tab-switch and randomisation standards.
- Check activities one at a time, and only with the owner's approval.
