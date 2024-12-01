<script>
    var audio = document.getElementById('music');
    audio.play().then(function() {
        console.log('Music is playing!');
    }).catch(function(error) {
        console.log('Error playing music:', error);
    });
</script>
