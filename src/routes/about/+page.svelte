<script>
  import github from "$lib/assets/github.svg";
  import Header from "../../lib/Menu.svelte";
</script>

<Header />

<section class="flex flex-col justify-items-center justify-center gap-y-10">
  <div class="flex justify-items-center justify-center">
    <h1 class="text-3xl font-bold">Chi sono</h1>
  </div>
  <div class="flex justify-items-center justify-center">
    <article class="max-w-lg">
      <p class="p-5">
        Mi chiamo Andrea Ceccarelli, sono un software engineer e questo è il mio
        angolo sul web, dove racconto di codice, corse, cinema e tutto quello
        che mi appassiona.
      </p>
      <p class="p-5">
        Per più di dieci anni ho lavorato nel mondo dell'automotive, occupandomi
        di revisioni auto e altri mestieri pratici. Ma la curiosità è una brutta
        bestia — e a un certo punto ho capito che volevo cambiare strada. Così
        ho iniziato a studiare programmazione da autodidatta, passando ore e ore
        tra tutorial, documentazioni e notti insonni davanti a uno schermo. Poi
        ho fatto le valigie e sono andato a Barcellona, dove ho frequentato una
        scuola di coding. Un'esperienza che mi ha aperto la porta al mondo dello
        sviluppo software. Tornato in Italia, sono approdato in Facile.it, dove
        ho avuto la fortuna di lavorare su progetti diversi e crescere come
        sviluppatore fino a diventare un full-stack software engineer.
      </p>
      <p class="p-5">
        Oggi lavoro con TypeScript, Node.js, Symfony, NestJS e altre tecnologie
        che mi permettono di costruire cose utili (e a volte anche belle). Ma
        non vivo solo di codice: corro regolarmente (e mi sto preparando per una
        mezza maratona), bevo birra artigianale con la stessa serietà con cui
        scrivo test automatizzati, adoro il cinema e leggo un sacco di
        fantascienza.
      </p>
      <p class="p-4">
        Questo blog nasce per condividere quello che imparo, raccontare i miei
        progetti, e ogni tanto scrivere due righe su ciò che mi appassiona. Se
        sei arrivato fin qui, grazie del tempo — magari ci beviamo una birra
        virtuale insieme tra un post e l’altro 🍻
      </p>
    </article>
  </div>
  <div class="flex justify-items-center justify-center">
    <a class="h-10" href="https://github.com/Glitches" target="_blank">
      <img class="h-10" alt="GitHub profile" src={github} />
    </a>
  </div>
</section>

<style>
  section {
    max-width: 800px;
    margin: 0 auto;
  }
</style>
