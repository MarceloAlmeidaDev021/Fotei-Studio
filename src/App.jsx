import React, { useState, useRef, useEffect } from "react";
import { flushSync } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  isValidCalendarDate,
  dateErrorMessage,
  toISODate,
  toDisplayDate,
  maskDate,
} from "./date-validation.js";
import { whatsappMessageUrl } from "./whatsapp.js";
gsap.registerPlugin(ScrollTrigger, useGSAP);
const reference = "/assets/studio-portrait-hd.png";
const portrait = "/assets/portrait.jpg";
const plans = [
  {
    name: "B\xE1sico",
    price: 385,
    feed: 4,
    reels: 4,
    stories: null,
    tiktok: 2,
    features: [
      "Planejamento mensal de conte\xFAdo",
      "4 posts no feed por m\xEAs",
      "4 Reels por m\xEAs",
      "Edi\xE7\xE3o de v\xEDdeos",
      "Legendas estrat\xE9gicas",
      "Agendamento das publica\xE7\xF5es",
      "Monitoramento e intera\xE7\xE3o b\xE1sica com seguidores",
      "Briefing mensal para alinhamento de objetivos (digital ou chamada)",
      "Relat\xF3rio simples de desempenho",
    ],
  },
  {
    name: "Intermedi\xE1rio",
    price: 590,
    feed: 8,
    reels: 8,
    stories: 12,
    tiktok: 4,
    features: [
      "Planejamento mensal de conte\xFAdo",
      "8 posts no feed por m\xEAs",
      "8 Reels por m\xEAs",
      "12 Stories por m\xEAs",
      "Cria\xE7\xE3o de artes personalizadas (incluindo campanhas e datas sazonais)",
      "Edi\xE7\xE3o de v\xEDdeos",
      "Legendas estrat\xE9gicas",
      "Agendamento das publica\xE7\xF5es",
      "Monitoramento e intera\xE7\xE3o b\xE1sica com seguidores",
      "Briefing mensal para alinhamento de objetivos (digital ou chamada)",
      "Reuni\xE3o mensal de alinhamento",
      "Relat\xF3rio completo de desempenho",
    ],
  },
  {
    name: "Premium",
    price: 910,
    feed: 12,
    reels: 12,
    stories: 20,
    tiktok: 6,
    features: [
      "Planejamento mensal estrat\xE9gico",
      "12 posts no feed por m\xEAs",
      "12 Reels por m\xEAs",
      "20 Stories por m\xEAs",
      "Cria\xE7\xE3o de artes personalizadas (incluindo campanhas e datas sazonais)",
      "Edi\xE7\xE3o de v\xEDdeos",
      "Legendas estrat\xE9gicas",
      "Agendamento das publica\xE7\xF5es",
      "Monitoramento e intera\xE7\xE3o b\xE1sica com seguidores",
      "Briefing mensal para alinhamento de objetivos (digital ou chamada)",
      "Relat\xF3rio detalhado de desempenho",
      "An\xE1lise de concorr\xEAncia",
      "Reuni\xE3o mensal de alinhamento",
      "2 sess\xF5es fotogr\xE1ficas mensais + grava\xE7\xF5es presenciais (at\xE9 2h cada)",
    ],
  },
];
const monthlyTotal = (name, tiktok = false) => {
  const p = plans.find((p2) => p2.name === name);
  if (!p) throw Error("Plano inv\xE1lido.");
  return p.price + (tiktok ? 150 : 0);
};
const initialBrief = {
  name: "",
  service: "Ensaio Fotogr\xE1fico",
  plan: "",
  tiktok: false,
  date: "",
  location: "",
  idea: "",
};
function makeBrief(data) {
  if (
    !data ||
    typeof data.name !== "string" ||
    !data.name.trim() ||
    data.name.length > 100
  )
    throw Error("Informe um nome v\xE1lido.");
  if (
    !["Ensaio Fotogr\xE1fico", "Gest\xE3o de Redes Sociais"].includes(
      data.service,
    )
  )
    throw Error("Escolha um servi\xE7o v\xE1lido.");
  for (const key of ["date", "location", "idea", "plan"])
    if (data[key] != null && typeof data[key] !== "string")
      throw Error("Dados inv\xE1lidos.");
  if (data.tiktok != null && typeof data.tiktok !== "boolean")
    throw Error("Adicional inv\xE1lido.");
  if ((data.location || "").length > 200 || (data.idea || "").length > 2e3)
    throw Error("Texto muito longo.");
  if (data.date && !isValidCalendarDate(toISODate(data.date)))
    throw Error(dateErrorMessage);
  let packageText = "";
  if (data.service === "Gest\xE3o de Redes Sociais" && data.plan) {
    monthlyTotal(data.plan, data.tiktok);
    packageText = `
Plano de interesse: ${data.plan}${data.tiktok ? " + adicional TikTok" : ""}
Valor mensal apresentado: R$ ${monthlyTotal(data.plan, data.tiktok)},00`;
  }
  return `Ol\xE1, Fotei Studio! Meu nome \xE9 ${data.name.trim()} e tenho interesse em ${data.service.toLowerCase()}.${packageText}${data.date ? "\nData prevista: " + toDisplayDate(data.date) : ""}${data.location ? "\nCidade ou local: " + data.location.trim() : ""}${data.idea ? "\nMinha ideia: " + data.idea.trim() : ""}
Gostaria de conversar sobre uma proposta para minhas necessidades.`;
}
function Brand({ light = false }) {
  return (
    <span className={`brand ${light ? "brand-light" : ""}`}>
      <span>FOTEI.</span>
      <span className="brand-studio">STUDIO</span>
    </span>
  );
}
function ReferencePhoto({ className = "" }) {
  return (
    <div className={`reference-crop ${className}`}>
      <span className="golden-arch" aria-hidden="true" />
      <img
        src={reference}
        alt="Retrato profissional baseado na fotografia de referência fornecida, em um estúdio de tons creme"
      />
    </div>
  );
}
function BriefForm({ data, setData }) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const result = useRef(null);
  const [dateError, setDateError] = useState("");
  function validateDateInput(input) {
    input.setCustomValidity("");
    const error =
      input.validity.badInput ||
      (input.value && !isValidCalendarDate(toISODate(input.value)))
        ? dateErrorMessage
        : "";
    input.setCustomValidity(error);
    setDateError(error);
    return !error;
  }
  function prepare(input) {
    const text = makeBrief(input);
    flushSync(() => {
      setData({ ...initialBrief, ...input });
      setMessage(text);
      setStatus("Mensagem pronta. Continue pelo WhatsApp para enviar.");
    });
    return { message: text, status: "prepared_not_sent" };
  }
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "prepare_photography_brief",
            description:
              "Prepara na tela uma mensagem de interesse em ensaio fotogr\xE1fico ou gest\xE3o de redes sociais. N\xE3o envia mensagens nem contrata servi\xE7os.",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", maxLength: 100 },
                service: {
                  type: "string",
                  enum: ["Ensaio Fotogr\xE1fico", "Gest\xE3o de Redes Sociais"],
                },
                plan: {
                  type: "string",
                  enum: ["", "B\xE1sico", "Intermedi\xE1rio", "Premium"],
                },
                tiktok: { type: "boolean" },
                date: {
                  type: "string",
                  description: "Data no formato dd/mm/aaaa ou aaaa-mm-dd.",
                },
                location: { type: "string", maxLength: 200 },
                idea: { type: "string", maxLength: 2e3 },
              },
              required: ["name", "service"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            execute: prepare,
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);
  const field = (key) => ({
    name: key,
    value: data[key],
    onChange: (e) =>
      setData((old) => ({
        ...old,
        [key]: e.target.value,
        ...(key === "service" && e.target.value === "Ensaio Fotogr\xE1fico"
          ? { plan: "", tiktok: false }
          : {}),
      })),
  });
  return (
    <form
      className="brief-form"
      onSubmit={(e) => {
        e.preventDefault();
        try {
          prepare(data);
          result.current?.scrollIntoView({
            block: "nearest",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          });
        } catch (error) {
          setStatus(error.message);
        }
      }}
    >
      <div className="form-row">
        <label>
          Seu nome
          <input
            {...field("name")}
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Como podemos chamar você?"
          />
        </label>
        <label>
          Seu interesse
          <select {...field("service")}>
            <option>Ensaio Fotográfico</option>
            <option>Gestão de Redes Sociais</option>
          </select>
        </label>
      </div>
      {data.service === "Gest\xE3o de Redes Sociais" && (
        <div className="form-plan">
          <label>
            Plano
            <select {...field("plan")}>
              <option value="">Quero ajuda para escolher</option>
              {plans.map((p) => (
                <option key={p.name}>{p.name}</option>
              ))}
            </select>
          </label>
          <label className="form-check">
            <input
              type="checkbox"
              checked={data.tiktok}
              onChange={(e) =>
                setData((old) => ({ ...old, tiktok: e.target.checked }))
              }
            />
            Adicionar TikTok (+ R$ 150/mês)
          </label>
          {data.plan && (
            <p className="form-total">
              Plano {data.plan}: R$ {monthlyTotal(data.plan, data.tiktok)}/mês
            </p>
          )}
        </div>
      )}
      <div className="form-row">
        <label>
          {data.service === "Ensaio Fotogr\xE1fico"
            ? "Data prevista"
            : "Quando quer come\xE7ar?"}
          <input
            {...field("date")}
            value={toDisplayDate(data.date)}
            type="text"
            inputMode="numeric"
            placeholder="dd/mm/aaaa"
            maxLength={10}
            pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
            aria-invalid={dateError ? true : void 0}
            aria-describedby={dateError ? "brief-date-error" : void 0}
            onChange={(e) => {
              const date = maskDate(e.currentTarget.value);
              e.currentTarget.value = date;
              setData((old) => ({ ...old, date }));
              validateDateInput(e.currentTarget);
            }}
            onBlur={(e) => {
              if (!validateDateInput(e.currentTarget))
                e.currentTarget.reportValidity();
            }}
            onInvalid={(e) => {
              validateDateInput(e.currentTarget);
            }}
          />
          {dateError && (
            <span id="brief-date-error" className="field-error" role="alert">
              {dateError}
            </span>
          )}
        </label>
        <label>
          Cidade ou local
          <input
            {...field("location")}
            maxLength={200}
            placeholder="Onde você está?"
          />
        </label>
      </div>
      <label>
        {data.service === "Ensaio Fotogr\xE1fico"
          ? "Sua ideia para o ensaio"
          : "Sobre sua marca"}
        <textarea
          {...field("idea")}
          rows={3}
          maxLength={2e3}
          placeholder="Conte sua ideia e o que você precisa."
        />
      </label>
      <button className="button button-gold" type="submit">
        Preparar minha mensagem
      </button>
      <p className="form-help">
        Confira sua mensagem e continue pelo WhatsApp. Você confirma o envio na
        conversa.
      </p>
      {message && (
        <div className="message-result" ref={result}>
          <label>
            Sua mensagem
            <textarea readOnly value={message} rows={8} />
          </label>
          <div className="message-actions">
            <a
              className="button button-gold"
              href={whatsappMessageUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Enviar pelo WhatsApp
            </a>
            <a
              className="text-link"
              href="https://www.instagram.com/fotei.studio/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir Instagram
            </a>
          </div>
        </div>
      )}
      <p className="form-status" role="status">
        {status}
      </p>
    </form>
  );
}
function App() {
  const root = useRef(null);
  const [activeService, setActiveService] = useState(0);
  const [tiktok, setTiktok] = useState(false);
  const [data, setData] = useState(initialBrief);
  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".hero-enter", {
          y: 25,
          opacity: 0,
          stagger: 0.12,
          duration: 1,
          ease: "power3.out",
          clearProps: "all",
        });
        gsap.utils.toArray(".scroll-frame").forEach((frame) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: frame,
                start: "top 95%",
                end: "bottom top",
                scrub: 0.7,
              },
            })
            .fromTo(
              frame.querySelector("img"),
              { scale: 0.8, opacity: 1 },
              { scale: 1, opacity: 1, duration: 1, ease: "none" },
            )
            .to(frame.querySelector("img"), {
              scale: 1.03,
              opacity: 0.2,
              duration: 1,
              ease: "none",
            });
        });
        gsap.utils.toArray(".reveal").forEach((el) =>
          gsap.from(el, {
            y: 25,
            opacity: 0,
            ease: "power2.out",
            duration: 0.8,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            clearProps: "all",
          }),
        );
      });
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      const images = root.current.querySelectorAll("img");
      images.forEach((img) => img.addEventListener("load", refresh));
      return () => {
        media.revert();
        images.forEach((img) => img.removeEventListener("load", refresh));
      };
    },
    { scope: root },
  );
  function choose(service, plan = "") {
    setData((old) => ({
      ...old,
      service,
      plan,
      tiktok: service === "Gest\xE3o de Redes Sociais" ? tiktok : false,
    }));
  }
  const services = [
    {
      title: "Ensaios fotogr\xE1ficos",
      image: portrait,
      description:
        "Retratos que traduzem quem voc\xEA \xE9. Ensaios pessoais, profissionais e de marca, com dire\xE7\xE3o cuidadosa e espa\xE7o para a sua ess\xEAncia.",
      cta: "Quero um ensaio",
      service: "Ensaio Fotogr\xE1fico",
    },
    {
      title: "Gest\xE3o de redes sociais",
      image: reference,
      description:
        "Transforme sua presen\xE7a digital com planejamento de conte\xFAdo, cria\xE7\xE3o de posts e Reels, legendas estrat\xE9gicas e acompanhamento de desempenho. Uma gest\xE3o alinhada \xE0 identidade e aos objetivos da sua marca.",
      cta: "Seguir para contrata\xE7\xE3o",
      service: "Gest\xE3o de Redes Sociais",
    },
  ];
  return (
    <div ref={root}>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="navigation">
        <a href="#inicio" aria-label="Fotei Studio início">
          <Brand />
        </a>
        <nav aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#planos">Planos</a>
          <a href="#studio">O studio</a>
        </nav>
        <a className="nav-contact" href="#contato">
          Vamos conversar
        </a>
      </header>
      <main id="conteudo" className="overflow-x-hidden w-full max-w-full">
        <section className="hero" id="inicio">
          <div className="hero-heading">
            <p className="hero-enter hero-subtitle">
              Ensaios fotográficos e gestão de redes sociais
            </p>
            <h1 className="hero-enter max-w-6xl">
              <span>
                Sua <em>essência.</em>
              </span>
              <span>
                Sua <em>presença.</em>
              </span>
            </h1>
            <p className="hero-enter hero-description">
              Imagens que revelam você.
              <br />
              Conteúdo que conecta a sua marca.
            </p>
            <div className="hero-enter hero-actions">
              <a
                className="button button-dark"
                href="#planos"
                onClick={() => choose("Gest\xE3o de Redes Sociais")}
              >
                Conheça os planos
              </a>
              <a
                className="button button-outline"
                href="#contato"
                onClick={() => choose("Ensaio Fotogr\xE1fico")}
              >
                Quero um ensaio
              </a>
            </div>
          </div>
          <div className="hero-media">
            <div className="hero-media-copy">
              <p>
                Um olhar atento.
                <br />
                Uma presença
                <br />
                <em>que faz sentido.</em>
              </p>
              <span>Fotei Studio · by Thaina Rocha</span>
            </div>
            <ReferencePhoto />
            <div className="hero-media-bottom">
              <span>Estratégia. Conteúdo. Conexão.</span>
              <a
                href="https://www.instagram.com/fotei.studio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @fotei.studio
              </a>
            </div>
          </div>
        </section>
        <section className="intro chapter" id="studio">
          <div className="intro-head reveal">
            <h2>
              Uma imagem{" "}
              <span className="inline-photo">
                <img src={portrait} alt="" loading="lazy" />
              </span>
              <br />
              com <em>intenção.</em>
            </h2>
            <p>
              Mais do que aparecer, é preciso se reconhecer. Em um retrato, no
              conteúdo, na forma de contar sua história.
            </p>
          </div>
          <div className="bento grid-flow-dense">
            <div className="bento-portrait">
              <img
                src={portrait}
                alt="Retrato natural de um casal em um abraço"
                loading="lazy"
              />
              <span>
                Autenticidade
                <br />
                em cada registro.
              </span>
            </div>
            <div className="bento-manifesto">
              <h3>
                Sua marca tem
                <br />
                uma <em>história.</em>
              </h3>
              <p>
                Estratégia personalizada, conteúdo autêntico e criatividade para
                dar forma à sua presença digital.
              </p>
              <span className="signature">by Thaina Rocha</span>
            </div>
            <a className="bento-link" href="#planos">
              <span>
                Transforme presença
                <br />
                em <em>conexão.</em>
              </span>
              <p>Conheça a gestão de redes sociais</p>
            </a>
          </div>
        </section>
        <section className="services chapter" id="servicos">
          <div className="section-head reveal">
            <h2>
              Do retrato
              <br />à <em>sua marca.</em>
            </h2>
            <p>
              Duas formas de contar
              <br />o que torna você único.
            </p>
          </div>
          <div className="accordion">
            {services.map((service, i) => (
              <article
                key={service.service}
                className={`service-panel ${activeService === i ? "is-active" : ""}`}
                onMouseEnter={() => setActiveService(i)}
              >
                {i === 0 ? (
                  <img src={service.image} alt="" loading="lazy" />
                ) : (
                  <ReferencePhoto />
                )}
                <div className="panel-wash" />
                <button
                  className="panel-toggle"
                  aria-expanded={activeService === i}
                  aria-controls={`service-${i}`}
                  onFocus={() => setActiveService(i)}
                  onClick={() => setActiveService(i)}
                >
                  <span>{service.title}</span>
                  <span aria-hidden="true">
                    {activeService === i ? "\u2212" : "+"}
                  </span>
                </button>
                <div
                  className="panel-content"
                  id={`service-${i}`}
                  hidden={activeService !== i}
                >
                  <p>{service.description}</p>
                  <a
                    className="button button-cream"
                    href="#contato"
                    onClick={() => choose(service.service)}
                  >
                    {service.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
        <div
          className="marquee"
          aria-label="Estratégia, conteúdo, conexão e resultados"
        >
          <div className="marquee-track" aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <span key={n}>
                Estratégia
                <i />
                Conteúdo
                <i />
                Conexão
                <i />
                Resultados
                <i />
              </span>
            ))}
          </div>
        </div>
        <section className="story chapter">
          <div className="story-stack">
            <article className="story-card reveal">
              <div className="story-image scroll-frame">
                <img
                  src={portrait}
                  alt="Ensaio de casal em um ambiente natural"
                  loading="lazy"
                />
              </div>
              <div className="story-content">
                <span className="service-label">Ensaios fotográficos</span>
                <h2>
                  Você, do
                  <br />
                  <em>seu jeito.</em>
                </h2>
                <p>
                  Um ensaio para celebrar sua fase, atualizar seu retrato
                  profissional ou apresentar a pessoa por trás da sua marca.
                </p>
                <p>
                  O formato é pensado a partir da sua ideia. Valores e detalhes
                  sob consulta.
                </p>
                <a
                  className="button button-dark"
                  href="#contato"
                  onClick={() => choose("Ensaio Fotogr\xE1fico")}
                >
                  Planejar meu ensaio
                </a>
                <span className="illustrative-note">
                  Imagem de ensaio ilustrativa.
                </span>
              </div>
            </article>
            <article className="story-card story-brand reveal">
              <div className="story-content">
                <span className="service-label">Gestão de redes sociais</span>
                <h2>
                  Conteúdo com
                  <br />
                  <em>direção.</em>
                </h2>
                <p>
                  Planejamento para organizar sua comunicação. Conteúdo para
                  expressar sua identidade. Acompanhamento para entender o que
                  funciona.
                </p>
                <p>
                  Escolha uma base para a sua marca e ajuste a proposta às
                  necessidades do seu negócio.
                </p>
                <a className="button button-gold" href="#planos">
                  Encontre seu plano
                </a>
              </div>
              <div className="story-brand-visual">
                <span className="brand-arch" aria-hidden="true" />
                <Brand light />
                <p>
                  Estratégia personalizada.
                  <br />
                  Conteúdo autêntico.
                  <br />
                  Foco em resultados.
                </p>
                <div className="brand-lines" aria-hidden="true" />
              </div>
            </article>
          </div>
        </section>
        <section className="pricing chapter" id="planos">
          <div className="pricing-heading reveal">
            <p className="service-label">Gestão de redes sociais</p>
            <h2>
              Um plano para
              <br />
              <em>o seu momento.</em>
            </h2>
            <p>Escolha a base ideal para a presença digital do seu negócio.</p>
          </div>
          <div className="price-grid">
            {plans.map((plan) => (
              <article
                className={`price-card ${plan.name === "Premium" ? "premium" : ""}`}
                key={plan.name}
              >
                {plan.name === "Premium" && (
                  <span className="plan-badge">Mais completo</span>
                )}
                <h3>{plan.name}</h3>
                <p className="price">
                  <span>R$</span> {monthlyTotal(plan.name, tiktok)}
                  <span>/mês</span>
                </p>
                {tiktok && (
                  <p className="price-add-note">
                    Inclui o adicional TikTok de R$ 150/mês
                  </p>
                )}
                <div className="plan-metrics">
                  <span>
                    <strong>{plan.feed}</strong> posts
                  </span>
                  <span>
                    <strong>{plan.reels}</strong> Reels
                  </span>
                  {plan.stories && (
                    <span>
                      <strong>{plan.stories}</strong> Stories
                    </span>
                  )}
                </div>
                <ul>
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                {tiktok && (
                  <p className="exclusive-videos">
                    + {plan.tiktok} vídeos exclusivos para TikTok/mês
                  </p>
                )}
                <a
                  className={`button ${plan.name === "Premium" ? "button-gold" : "button-outline"}`}
                  href="#contato"
                  onClick={() =>
                    choose("Gest\xE3o de Redes Sociais", plan.name)
                  }
                >
                  Escolher {plan.name}
                </a>
              </article>
            ))}
          </div>
          <div className="tiktok-option">
            <div className="tiktok-heading">
              <span>Adicional</span>
              <h3>TikTok</h3>
              <p>
                + R$ <strong>150</strong>/mês
              </p>
              <label className="tiktok-toggle">
                <input
                  type="checkbox"
                  checked={tiktok}
                  onChange={(e) => {
                    setTiktok(e.target.checked);
                    setData((old) => ({
                      ...old,
                      tiktok:
                        old.service === "Gest\xE3o de Redes Sociais"
                          ? e.target.checked
                          : false,
                    }));
                  }}
                />
                <span className="toggle-track" aria-hidden="true" />
                <span>Incluir nos planos</span>
              </label>
            </div>
            <div className="tiktok-benefits">
              <p>Publicação dos conteúdos na plataforma</p>
              <p>Pesquisa de tendências, áudios e hashtags</p>
              <p>Criação de vídeos exclusivos para TikTok</p>
            </div>
            <div className="tiktok-counts">
              <p>Vídeos exclusivos por mês</p>
              {plans.map((p) => (
                <div key={p.name}>
                  <span>{p.name}</span>
                  <strong>{p.tiktok} vídeos</strong>
                </div>
              ))}
            </div>
          </div>
          <p className="plan-note">
            Os pacotes podem ser ajustados conforme as necessidades do seu
            negócio.
          </p>
          <div className="shoot-proposal">
            <div>
              <p className="service-label">Ensaios fotográficos</p>
              <h3>
                Um ensaio pensado <em>para você.</em>
              </h3>
              <p>
                Retratos pessoais, profissionais ou para a sua marca. Conte sua
                ideia para montar uma proposta.
              </p>
            </div>
            <div>
              <span className="on-request">Sob consulta</span>
              <a
                className="button button-dark"
                href="#contato"
                onClick={() => choose("Ensaio Fotogr\xE1fico")}
              >
                Solicitar proposta
              </a>
            </div>
          </div>
        </section>
        <section className="contact chapter" id="contato">
          <div className="contact-heading reveal">
            <h2>
              Vamos dar forma
              <br />à <em>sua presença?</em>
            </h2>
            <p>
              Conte sua ideia.
              <br />O próximo passo começa com uma conversa.
            </p>
          </div>
          <div className="contact-layout">
            <div className="contact-aside">
              <Brand light />
              <p>
                Ensaios fotográficos.
                <br />
                Gestão de redes sociais.
              </p>
              <a
                className="instagram-link"
                href="https://www.instagram.com/fotei.studio/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @fotei.studio
              </a>
              <span className="signature">by Thaina Rocha</span>
            </div>
            <BriefForm data={data} setData={setData} />
          </div>
        </section>
      </main>
      <footer>
        <a href="#inicio" aria-label="Voltar ao início">
          <Brand />
        </a>
        <p>Estratégia. Conteúdo. Conexão.</p>
        <a
          href="https://www.instagram.com/fotei.studio/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram
        </a>
        <a href="/credits.html">Créditos</a>
        <span>© 2026 Fotei Studio</span>
      </footer>
    </div>
  );
}
export { App as default, initialBrief, makeBrief, monthlyTotal, plans };
