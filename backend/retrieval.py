"""Semantic retrieval over page metadata. Hybrid: local sentence embeddings (if available) + TF-IDF."""
import json, os
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

CATALOG = json.load(open(Path(__file__).parent / "catalog.json"))
PAGES = CATALOG["pages"]

def page_text(p):
    filt = " ".join(f"{f['label']} {' '.join(f['options'])}" for f in p["availableFilters"].values())
    sorts = " ".join(s["label"] for s in p["availableSorts"])
    widgets = " ".join(w["title"] for w in p["widgets"])
    return f"{p['title']}. {p['directory']}. {p['description']}. Keywords: {' '.join(p['keywords'])}. Filters: {filt}. Sorts: {sorts}. Widgets: {widgets}"

class Retriever:
    def __init__(self):
        self.ids = list(PAGES)
        self.texts = [page_text(PAGES[i]) for i in self.ids]
        self.vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english")
        self.mat = self.vec.fit_transform(self.texts)
        self.mode, self.model, self.emb = "tfidf", None, None
        if os.getenv("USE_EMBEDDINGS", "1") == "1":
            try:
                from sentence_transformers import SentenceTransformer
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
                self.emb = self.model.encode(self.texts, normalize_embeddings=True)
                self.mode = "hybrid(embeddings+tfidf)"
            except Exception as e:
                print("[retrieval] embeddings unavailable, using TF-IDF only:", e)

    def search(self, query, k=5):
        s = (self.mat @ self.vec.transform([query]).T).toarray().ravel()
        if self.emb is not None:
            e = self.emb @ self.model.encode([query], normalize_embeddings=True)[0]
            s = 0.7 * e + 0.3 * s
        top = np.argsort(-s)[:k]
        return [{"page_id": self.ids[i], "score": round(float(s[i]), 4)} for i in top]

_R = None
def get_retriever():
    global _R
    if _R is None:
        _R = Retriever()
    return _R
