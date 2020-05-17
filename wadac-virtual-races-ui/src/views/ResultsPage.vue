<template>
  <div class="results-page">
    <LiveResults/>
    <p class="footer">
  	If you experience any problems, please contact <a class="mailto" href="mailto:dancunnington@hotmail.co.uk">Dan Cunnington</a>.
  	</p>
  </div>
</template>

<script>
// @ is an alias to /src
import LiveResults from '@/components/results/LiveResults.vue'

export default {
  name: 'ResultsPage',
  components: {
    LiveResults
  }
}
</script>
<style>
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