"""
skills_database.py

A curated list of technical skills the parser looks for inside a resume's
Skills section (and, as a fallback, the whole document). Matching is done
on normalized (lowercase, punctuation-stripped) tokens/phrases so that
"Node.js", "NodeJS", and "node js" all match the same canonical skill.

Extend this list freely -- it directly controls what counts toward
`cv_skills` in the output feature vector.
"""

# canonical_skill_name -> list of surface-form variants that should match it
SKILLS_DB = {
    # Programming languages
    "python": ["python", "python3"],
    "java": ["java"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "c": ["c programming language", "c programming"],
    "c++": ["c++", "cpp"],
    "c#": ["c#", "csharp"],
    "go": ["golang"],
    "rust": ["rust"],
    "php": ["php"],
    "ruby": ["ruby"],
    "kotlin": ["kotlin"],
    "swift": ["swift"],
    "r": ["r programming language", "r programming"],
    "sql": ["sql"],
    "matlab": ["matlab"],

    # Web / frontend
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "react": ["react.js", "reactjs", "react"],
    "next.js": ["next.js", "nextjs"],
    "vue": ["vue.js", "vuejs", "vue"],
    "angular": ["angular", "angularjs"],
    "tailwind css": ["tailwind", "tailwindcss"],
    "bootstrap": ["bootstrap"],
    "redux": ["redux"],
    "jquery": ["jquery"],

    # Backend / frameworks
    "node.js": ["node.js", "nodejs", "node js"],
    "express.js": ["express.js", "expressjs", "express"],
    "django": ["django"],
    "flask": ["flask"],
    "fastapi": ["fastapi"],
    "spring boot": ["spring boot", "springboot", "spring"],
    "asp.net": ["asp.net", "aspnet"],
    "laravel": ["laravel"],
    "graphql": ["graphql"],
    "rest api": ["rest api", "restful api", "rest apis"],

    # Databases
    "postgresql": ["postgresql", "postgres"],
    "mysql": ["mysql"],
    "mongodb": ["mongodb", "mongo"],
    "sqlite": ["sqlite"],
    "redis": ["redis"],
    "firebase": ["firebase"],
    "oracle db": ["oracle database", "oracle db"],

    # Data / ML / AI
    "machine learning": ["machine learning", "ml"],
    "deep learning": ["deep learning", "dl"],
    "nlp": ["nlp", "natural language processing"],
    "computer vision": ["computer vision", "opencv"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "xgboost": ["xgboost"],
    "tensorflow": ["tensorflow"],
    "pytorch": ["pytorch"],
    "keras": ["keras"],
    "spacy": ["spacy"],
    "data analysis": ["data analysis", "data analytics"],
    "power bi": ["power bi", "powerbi"],
    "tableau": ["tableau"],

    # DevOps / cloud / tools
    "docker": ["docker"],
    "kubernetes": ["kubernetes", "k8s"],
    "git": ["git"],
    "github": ["github"],
    "gitlab": ["gitlab"],
    "ci/cd": ["ci/cd", "ci cd", "continuous integration"],
    "aws": ["aws", "amazon web services"],
    "azure": ["azure", "microsoft azure"],
    "gcp": ["gcp", "google cloud"],
    "linux": ["linux"],
    "nginx": ["nginx"],
    "jenkins": ["jenkins"],
    "postman": ["postman"],
    "figma": ["figma"],

    # Mobile
    "android": ["android"],
    "flutter": ["flutter"],
    "react native": ["react native"],

    # Other CS fundamentals often listed
    "data structures": ["data structures", "dsa"],
    "algorithms": ["algorithms"],
    "oop": ["oop", "object oriented programming", "object-oriented programming"],
}
