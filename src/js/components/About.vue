<template>
  <div id="about" uk-modal>
    <div class="uk-modal-dialog">
      <button class="uk-modal-close-default" type="button" uk-close></button>
      <div class="uk-modal-header">
        <h2 class="uk-modal-title">About Cadê a Capoeira?</h2>
      </div>
      <div class="uk-modal-body">
        <p>
          <em>Cadê a Capoeira?</em> is a free tool anyone can use to find online listings of <b>capoeira</b> schools
          and groups all over the world. The data is collected city-by-city and is updated periodically.
        </p>
        <p>
          One purpose of this tool is to show the strength of a capoeira group's online presence &amp; searchability --
          this is reflected by the <b>score</b>.
        </p>
        <p>
          The data is currently collected from the
          <a href="https://developers.google.com/places/">Google Places API.</a> That means that the data reflects
          Google search results for the keyword "capoeira" and does not mean that each place actually practices
          capoeira.
        </p>
        <p>
          <em>Cadê a Capoeira?</em> was created and is maintained by <a href="https://www.capoeiraonline.net">Capoeira Online</a>.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import 'uikit/dist/css/uikit.min.css';

export default {
  name: 'about',
};
</script>

<style>
</style>
