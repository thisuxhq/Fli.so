<script lang="ts">
  interface PageData {
    session_id: string;
  }
  let { data }: { data: PageData } = $props();
</script>

<h1>Success</h1>
<p>Thank you for submitting the form!</p>
<p>Your session ID is: {data.session_id}</p>
