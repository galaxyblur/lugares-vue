<template>
  <header>
    <nav class="uk-navbar-container" uk-navbar>
      <div class="uk-navbar-center">
        <ul class="uk-navbar-nav">
          <li>
            <a href="/" class="uk-navbar-item uk-logo">Lugares - Capoeira Finder</a>
          </li>
        </ul>
      </div>
    </nav>
    <router-view></router-view>
  </header>
</template>

<script>
export default {
  name: 'app',
};
</script>

<style>
</style>
