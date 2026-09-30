"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  GithubLogo,
  MagnifyingGlass,
  X,
  SquaresFour,
  List,
  CornersOut,
  CaretLeft,
  CaretRight,
} from "@phosphor-icons/react";
import { useState } from "react";
import { projectRegistry, projectStatusLabel } from "@/registry/projects";
import { ProjectArtwork, ProjectPreview } from "./ProjectPreview";
import { ProjectLinks } from "./ProjectLinks";
import { ProjectQuickView } from "./ProjectQuickView";
import styles from "./ProjectShowcase.module.css";

const collections = [
  "All",
  "Client sites",
  "Web",
  "Tools",
  "Play",
  "Archive",
] as const;
const clientProjects = projectRegistry.filter(
  (project) => project.collection === "Client sites",
);

export function ProjectShowcase() {
  const [collection, setCollection] =
    useState<(typeof collections)[number]>("All");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"gallery" | "list">("gallery");
  const [selectedClient, setSelectedClient] = useState(0);
  const [quickView, setQuickView] = useState<string | null>(null);
  const search = query.trim().toLocaleLowerCase();
  const visible = projectRegistry.filter(
    (project) =>
      (collection === "All" || project.collection === collection) &&
      [
        project.title,
        project.category,
        project.shortDescription,
        ...project.technologies,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search),
  );
  const featured = visible.filter((project) => project.featured);
  const directory = visible.filter((project) => !project.featured);
  const client = clientProjects[selectedClient];
  const showSpotlight = collection === "All" && !search;
  const previewProject = visible.find((project) => project.slug === quickView);

  return (
    <article
      className={styles.showcase}
      data-route-content
      data-project-showcase
    >
      <header className={styles.header}>
        <div>
          <h1 tabIndex={-1}>
            Websites & software<span aria-hidden="true">.</span>
          </h1>
          <p>Websites with character. Tools with purpose.</p>
        </div>
        <a
          className={styles.github}
          href="https://github.com/westcoselabs"
          target="_blank"
          rel="noreferrer"
          aria-label="WestCose Labs on GitHub"
        >
          <GithubLogo size={23} weight="fill" />
          <span>GitHub</span>
          <ArrowUpRight size={16} />
        </a>
      </header>
      {showSpotlight && (
        <section
          className={styles.spotlight}
          aria-label="Client work spotlight"
        >
          <div className={styles.spotlightMain}>
            <ProjectPreview key={client.slug} project={client} />
            <div className={styles.spotlightCopy} key={`copy-${client.slug}`}>
              <span className={styles.eyebrow}>
                Client work / {client.category}
              </span>
              <h2>{client.title}</h2>
              <p>{client.shortDescription}</p>
              <ProjectLinks project={client} />
              <div className={styles.spotlightPaging}>
                <span aria-live="polite">
                  {String(selectedClient + 1).padStart(2, "0")}{" "}
                  <span>
                    / {String(clientProjects.length).padStart(2, "0")}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label="Previous client project"
                  onClick={() =>
                    setSelectedClient(
                      (selectedClient + clientProjects.length - 1) %
                        clientProjects.length,
                    )
                  }
                >
                  <CaretLeft size={19} />
                </button>
                <button
                  type="button"
                  aria-label="Next client project"
                  onClick={() =>
                    setSelectedClient(
                      (selectedClient + 1) % clientProjects.length,
                    )
                  }
                >
                  <CaretRight size={19} />
                </button>
              </div>
            </div>
          </div>
          <div
            className={styles.clientSelector}
            role="group"
            aria-label="Select a client project"
          >
            {clientProjects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                aria-pressed={selectedClient === index}
                onClick={() => setSelectedClient(index)}
                aria-label={`Show ${project.title}`}
              >
                <span className={styles.clientThumb}>
                  <ProjectArtwork project={project} />
                </span>
                <span>
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      <section
        className={styles.collection}
        aria-labelledby="project-collection-title"
      >
        <div className={styles.collectionHeader}>
          <h2 id="project-collection-title">
            The collection<span>{projectRegistry.length}</span>
          </h2>
          <div
            className={styles.viewControl}
            role="group"
            aria-label="Project layout"
          >
            <button
              type="button"
              aria-label="Gallery view"
              aria-pressed={view === "gallery"}
              onClick={() => setView("gallery")}
            >
              <SquaresFour size={20} />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List size={20} />
            </button>
          </div>
        </div>
        <div className={styles.browserTools}>
          <div
            className={styles.filters}
            role="group"
            aria-label="Filter projects"
          >
            {collections.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={collection === name}
                onClick={() => setCollection(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className={styles.search}>
            <MagnifyingGlass size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Search projects"
              placeholder="Find a project…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="sr-only" role="status">
          {visible.length} projects shown
        </p>
        {featured.length > 0 && (
          <div
            className={styles.grid}
            data-view={view}
            aria-label="Featured projects"
          >
            {featured.map((project) => (
              <article
                className={`${styles.card} project-card`}
                key={project.slug}
                data-project-card={project.slug}
              >
                <button
                  type="button"
                  className={styles.artButton}
                  aria-label={`Preview ${project.title}`}
                  aria-haspopup="dialog"
                  onClick={() => setQuickView(project.slug)}
                >
                  <ProjectArtwork project={project} />
                  <span className={styles.previewAffordance}>
                    <CornersOut size={19} />
                    <span>Quick look</span>
                  </span>
                </button>
                <div className={styles.cardContent}>
                  <div className={styles.cardMeta}>
                    <span>{project.category}</span>
                    <span>{projectStatusLabel(project).split(" · ")[0]}</span>
                  </div>
                  <h3>
                    <Link href={`/projects/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h3>
                  <p>{project.shortDescription}</p>
                  <div className={styles.cardLinks}>
                    <Link
                      href={`/projects/${project.slug}`}
                      aria-label={`Explore ${project.title}`}
                    >
                      Explore project
                      <ArrowRight size={16} />
                    </Link>
                    <a
                      href={project.liveUrl ?? project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.liveUrl ? "Visit" : "View source for"} ${project.title}`}
                    >
                      {project.liveUrl ? (
                        <ArrowUpRight size={20} />
                      ) : (
                        <GithubLogo size={20} />
                      )}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {directory.length > 0 && (
          <section
            className={styles.directory}
            aria-labelledby="repository-title"
          >
            <h3 id="repository-title">From the workbench</h3>
            <div className={styles.repositoryGrid}>
              {directory.map((project) => (
                <article
                  className={styles.repository}
                  key={project.slug}
                  data-project-card={project.slug}
                >
                  <button
                    className={styles.repositoryIcon}
                    type="button"
                    aria-label={`Preview ${project.title}`}
                    aria-haspopup="dialog"
                    onClick={() => setQuickView(project.slug)}
                  >
                    <ProjectArtwork project={project} />
                  </button>
                  <div>
                    <h4>
                      <Link href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h4>
                    <p>{project.shortDescription}</p>
                  </div>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View source for ${project.title}`}
                  >
                    <ArrowUpRight size={22} />
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}
        {!visible.length && (
          <div className={styles.empty}>
            <MagnifyingGlass size={32} />
            <h3>No projects found</h3>
            <p>Try another name, category, or technology.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCollection("All");
              }}
            >
              Show all projects
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
      <footer className={styles.footer}>
        <span>Designed & built by WestCose.</span>
        <a
          href="https://github.com/westcoselabs?tab=repositories"
          target="_blank"
          rel="noreferrer"
        >
          More on GitHub
          <ArrowUpRight size={15} />
        </a>
      </footer>
      {previewProject && (
        <ProjectQuickView
          project={previewProject}
          projects={visible}
          onSelect={setQuickView}
          onClose={() => setQuickView(null)}
        />
      )}
    </article>
  );
}
