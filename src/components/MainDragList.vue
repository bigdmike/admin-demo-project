<script setup>
  import { ref } from 'vue'
  import draggable from 'vuedraggable'

  const sortItems = ref([])
  const drag = ref(false)
  const dragOptions = {
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost',
  }

  function setSortData (data) {
    sortItems.value = data
  }

  defineExpose({
    sortItems,
    setSortData,
  })
</script>

<template>
  <v-list>
    <draggable
      v-model="sortItems"
      class="drag-list"
      group="people"
      item-key="id"
      v-bind="dragOptions"
      @end="drag=false"
      @start="drag=true"
    >
      <template #item="{element}">
        <div>
          <v-list-item class="text-body-medium drag-list-item">
            {{ element.name }}</v-list-item>

          <v-divider />
        </div>
      </template>
    </draggable>
  </v-list>
</template>
