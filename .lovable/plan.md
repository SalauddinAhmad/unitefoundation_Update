Update inner-page hero banners to match the reference site (assunnahfoundation.org/about):

1. **PageHero component** — remove the 35px outer padding and rounded corners. Make the banner full-width and edge-to-edge, starting from the very top of the viewport so the floating header sits on top of the image. Apply a green tint overlay over the image (matching primary brand color) and center the white title vertically. Use a taller height (~360–440px) for a premium feel, with extra top padding so the title clears the header.

2. **SiteLayout** — remove the `pt-28 md:pt-32` top padding from `<main>` on inner pages so the hero banner can touch the top edge of the viewport (image extends behind the floating header).

3. **Pages** — no changes needed. Blog, BlogPost, Gallery, Projects, About, Contact, and Donate already use the PageHero component, so the visual update applies everywhere automatically.

Result: every inner page shows a full-width image banner from the top of the page with the glass header floating over it and a centered title — identical layout to the reference site.