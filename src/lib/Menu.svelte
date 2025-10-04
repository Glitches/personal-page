<script>
  export const title = "";
  let isOpen = false;

  const links = [
    { href: "/", text: "Blog" },
    { href: "/about", text: "About" },
  ];

  const handleClick = () => isOpen = !isOpen;
</script>

<div class="menu-container">
  <button 
    class="hamburger" 
    class:open={isOpen} 
    on:click={handleClick} 
    aria-expanded={isOpen} 
    aria-label="Toggle menu"
  >
    <span></span>
    <span></span>
    <span></span>
  </button>

  {#if isOpen}
    <nav class="menu-items">
      {#each links as { href, text }}
        <a {href} class="menu-link">{text}</a>
      {/each}
    </nav>
  {/if}
</div>

<style>
  .menu-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    background-color: rgb(31, 41, 55);
    padding: 0.75rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .hamburger {
    cursor: pointer;
    width: 25px;
    height: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .hamburger span {
    display: block;
    height: 3px;
    width: 100%;
    background-color: #ffffff;
    transition: all 0.3s ease;
  }

  .hamburger.open span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  .hamburger.open span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.open span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  .menu-items {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: rgb(31, 41, 55);
    min-width: 120px;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-top: 0.5rem;
  }

  .menu-link {
    color: white;
    text-align: center;
    text-decoration: none;
    font-size: 1.125rem;
    font-weight: bold;
    transition: color 0.2s ease;
  }

  .menu-link:hover {
    color: #93c5fd;
  }
</style>
