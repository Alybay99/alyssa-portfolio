const fallbackContent = {
  profile: {
    name: "Alyssa",
    heroTitle: "把光影、远方与心事，安放在时间里。",
    heroCopy: "这里可以展示你的照片、影像项目、长文章，也可以收藏几句话的日常短文。",
    about:
      "在这里写一段你的自我介绍：你关注什么、喜欢拍什么、最近在做什么项目。这段文字可以很安静，也可以很锋利，取决于你想让别人怎样遇见你。",
    email: "hello@example.com",
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
  },
  works: [],
  articles: [],
  notes: [],
};

const typeLabels = {
  photo: "照片",
  video: "视频",
  essay: "文章",
  note: "短文",
};

const workGrid = document.querySelector("#work-grid");
const filterButtons = document.querySelectorAll(".filter-button");
const featuredArticle = document.querySelector("#featured-article");
const noteList = document.querySelector("#note-list");
const dialog = document.querySelector("#article-dialog");
const closeDialog = document.querySelector("#close-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogMeta = document.querySelector("#dialog-meta");
const dialogBody = document.querySelector("#dialog-body");

let siteContent = fallbackContent;
let articleMap = {};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createId(text, prefix) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return `${prefix}-${hash.toString(36)}`;
}

function normalizeContent(content) {
  const articles = Array.isArray(content.articles)
    ? content.articles.map((article) => ({
        ...article,
        id: article.id || createId(article.title || "article", "article"),
        body: Array.isArray(article.body)
          ? article.body.map((paragraph) =>
              typeof paragraph === "string" ? paragraph : paragraph.paragraph || "",
            )
          : [article.body || article.excerpt || ""],
      }))
    : [];

  const works = Array.isArray(content.works)
    ? content.works.map((work, index) => {
        const matchedArticle = articles.find((article) => article.title === work.title);
        return {
          ...work,
          id: work.id || createId(`${work.title || "work"}-${index}`, "work"),
          type: work.type || "photo",
          size: work.featured ? "large" : work.size || "",
          articleId: work.articleId || matchedArticle?.id || "",
        };
      })
    : [];

  return {
    profile: { ...fallbackContent.profile, ...(content.profile || {}) },
    works,
    articles,
    notes: Array.isArray(content.notes) ? content.notes : [],
  };
}

async function loadContent() {
  try {
    const response = await fetch(`content/site.json?v=${Date.now()}`);
    if (!response.ok) throw new Error("Content file unavailable");
    siteContent = normalizeContent(await response.json());
  } catch (error) {
    siteContent = normalizeContent(fallbackContent);
  }

  articleMap = siteContent.articles.reduce((collection, article) => {
    collection[article.id] = article;
    return collection;
  }, {});
}

function renderProfile() {
  const { profile } = siteContent;
  document.title = `${profile.name} - 个人作品集`;
  document.querySelector("#site-name").textContent = profile.name;
  document.querySelector("#hero-title").textContent = profile.heroTitle;
  document.querySelector("#hero-copy").textContent = profile.heroCopy;
  document.querySelector("#about-copy").textContent = profile.about;

  const emailLink = document.querySelector("#email-link");
  emailLink.textContent = profile.email || "Email";
  emailLink.href = profile.email ? `mailto:${profile.email}` : "#contact";
  document.querySelector("#instagram-link").href = profile.instagram || "#contact";
  document.querySelector("#youtube-link").href = profile.youtube || "#contact";
}

function renderWorks(filter = "all") {
  const visibleWorks = siteContent.works.filter(
    (work) => filter === "all" || work.type === filter,
  );
  workGrid.innerHTML = visibleWorks.map(createWorkCard).join("");
}

function createWorkCard(work) {
  const safeTitle = escapeHtml(work.title);
  const media = work.image
    ? `<img src="${escapeHtml(work.image)}" alt="${safeTitle}" />`
    : `<span class="${work.type === "video" ? "play-mark" : ""}">${work.type === "video" ? "▶" : typeLabels[work.type]}</span>`;

  const action = work.articleId
    ? `<button class="read-more" type="button" data-article="${escapeHtml(work.articleId)}">阅读全文</button>`
    : "";

  return `
    <article class="work-card ${work.size === "large" ? "large" : ""}">
      <div class="work-media ${work.type}-visual">${media}</div>
      <div class="work-body">
        <div class="work-meta">
          <span class="tag">${escapeHtml(typeLabels[work.type] || "作品")}</span>
          <span>${escapeHtml(work.date)}</span>
        </div>
        <h3>${safeTitle}</h3>
        <p>${escapeHtml(work.summary)}</p>
        ${action}
      </div>
    </article>
  `;
}

function renderWriting() {
  const [article] = siteContent.articles;
  if (!article) {
    featuredArticle.innerHTML = "";
    noteList.innerHTML = "";
    return;
  }

  featuredArticle.innerHTML = `
    <p class="eyebrow">${escapeHtml(article.meta)}</p>
    <h3>${escapeHtml(article.title)}</h3>
    <p>${escapeHtml(article.excerpt)}</p>
    <button class="read-more" type="button" data-article="${escapeHtml(article.id)}">阅读全文</button>
  `;

  noteList.innerHTML = siteContent.notes
    .map(
      (note) => `
        <article class="note-item">
          <time>${escapeHtml(note.date)}</time>
          <p>${escapeHtml(note.text)}</p>
        </article>
      `,
    )
    .join("");
}

function openArticle(articleId) {
  const article = articleMap[articleId];
  if (!article) return;

  dialogTitle.textContent = article.title;
  dialogMeta.textContent = article.meta;
  dialogBody.innerHTML = article.body
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  dialog.showModal();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderWorks(button.dataset.filter);
  });
});

document.addEventListener("click", (event) => {
  const articleButton = event.target.closest("[data-article]");
  if (articleButton) openArticle(articleButton.dataset.article);
});

closeDialog.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

loadContent().then(() => {
  renderProfile();
  renderWorks();
  renderWriting();
});
