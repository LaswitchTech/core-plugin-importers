<article id="layout"></article>
<script>
    (function () {
        $(document).ready(function(){
            builder.Layout('importer',"#layout",{id: '<?= $this->Request->getParams('GET', 'id') ?>'});
        });
    })();
</script>
