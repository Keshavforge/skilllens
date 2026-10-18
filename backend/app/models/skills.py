from dataclasses import dataclass


@dataclass(frozen=True)
class SkillRule:
    name: str
    aliases: tuple[str, ...]


# Add canonical names and carefully chosen aliases here. Matching uses word-aware
# patterns; aliases are not treated as proof of skill or experience.
SKILL_CATALOG: tuple[SkillRule, ...] = (
    SkillRule("JavaScript", ("javascript", "js")),
    SkillRule("TypeScript", ("typescript", "ts")),
    SkillRule("Python", ("python",)),
    SkillRule("React", ("react", "react.js", "reactjs")),
    SkillRule("HTML", ("html", "html5")),
    SkillRule("CSS", ("css", "css3")),
    SkillRule("SQL", ("sql", "postgresql", "mysql", "sqlite")),
    SkillRule("REST APIs", ("rest api", "rest apis", "restful api", "restful apis")),
    SkillRule("Git", ("git", "git version control")),
    SkillRule("Docker", ("docker",)),
    SkillRule("Automated testing", ("automated testing", "test automation", "testing automation")),
    SkillRule(
        "CI/CD",
        ("ci/cd", "continuous integration", "continuous delivery", "continuous integration and continuous delivery"),
    ),
)
