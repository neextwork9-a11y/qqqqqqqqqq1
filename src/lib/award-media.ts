import reference from '@/lib/reference-pages.json';

const images = import.meta.glob<{ default: string }>('/src/assets/imported/src/assets/hd/award-*.jpg', { eager: true });

/** Keep the original recognition labels; this page intentionally shows twelve concepts. */
export const awardsHtml = reference.pages.awards.html
  .replace(/<div class="col-sm-3 col-md-3">[\s\S]*?<\/div>/g, (item) => {
    const number = item.match(/recognition\/(\d+)/)?.[1];
    if (!number || Number(number) > 12) return '';
    const image = images[`/src/assets/imported/src/assets/hd/award-${number}.jpg`]?.default;
    if (!image) return '';
    return item.replace(`lifeos-media://recognition/${number}`, image)
      .replace(/<p class="recognition-caption">[\s\S]*?<\/p>/, '')
      .replace('<img ', `<a class="cbp-singlePage" href="${image}"><img `)
      .replace('/>', '/></a>');
  });