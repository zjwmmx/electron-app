import { defineComponent } from 'vue'
import './styles.scss'
import draggable from 'vuedraggable'

const Designer = defineComponent({
  name: 'Designer',
  setup: () => {
    const cards = [
      {
        name: '输入框',
        id: 1,
        type: 'input'
      }
    ]
    return () => {
      return (
        <div class="wrap">
          <draggable
            v-model={cards}
            group="people"
            item-key="id"
            clone={({ name }) => {
              return { name, id: idGlobal++ }
            }}
            group={{ name: 'people', pull: 'clone', put: false }}
            vSlots={{
              item: (element) => {
                return <div>{element.name}</div>
              }
            }}
            onStart="drag=true"
            onEnd="drag=false"
          ></draggable>
        </div>
      )
    }
  }
})

export default Designer
