<template>
  <div class="home">
    <Main/>
    <p class="footer">
  	If you experience any problems using this service, please contact <a class="mailto" href="mailto:dancunnington@hotmail.co.uk">Dan Cunnington</a>.
  	</p>
  </div>

</template>

<script>
// @ is an alias to /src
import Main from '@/components/Main.vue'

export default {
  name: 'Home',
  components: {
    Main
  }
}
</script>

<style>
	.home {
		/*padding-bottom: 50px;*/
		padding-left: 10px;
		padding-right: 10px;
	}
	p.footer {
		margin-top: 20px;
		margin-bottom: 20px;
	 	text-align: center;
	 	font-size: smaller;
	}
	a.mailto {
	 	color: blue !important;
	}
</style>