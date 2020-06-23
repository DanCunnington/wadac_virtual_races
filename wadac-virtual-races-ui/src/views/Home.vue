<template>
  <div class="home">
    <Main/>
    <p class="footer">
  	If you experience any problems, please contact <a class="mailto" href="info@winchesterppp.co.uk">info@winchesterppp.co.uk</a>. Macmillan really needs your support right now. A suggested donation of £5 would make a big difference. Please use our official fundraising page at <a class="mailto" href="https://www.justgiving.com/fundraising/pppvolunteers2020" target="_blank">PPP Macmillan Donation</a> or set up you own page on <a class="mailto" href="https://www.justgiving.com/start-fundraising" target="_blank">JustGiving</a>. Search for Macmillan, then click on ‘Taking part in an event’ and the PPP will be on the first page. Thank you.
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
	 	margin: 0 auto;
  		max-width: 520px;
	}
	a.mailto {
	 	color: blue !important;
	}
</style>