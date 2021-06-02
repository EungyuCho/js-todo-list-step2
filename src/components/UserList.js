import Component from '../core/Component.js'
import EVENT from '../constants/Event.js'
import { store } from '../modules/index.js'
import TodoConnector from '../utils/TodoConnector.js'
import { createUser, deleteUser, getUser } from '../modules/user/creator.js'

const UserListActions = {
  CREATE_USER: 'createUser',
  DELETE_USER: 'deleteUser',
  SELECT_USER: 'selectUser',
}

const UserListItem = (user, isActive) => {
  return `
        <button class='ripple ${isActive ? 'active' : ''}'
            data-action="${UserListActions.SELECT_USER}"
            data-user=${user._id}>
            ${user.name}
        </button>
    `
}

export default class UserList extends Component {
  async selectUser(userId) {
    const user = await TodoConnector.getUser(userId)
    store.dispatch(getUser(user))
  }

  async createUser(userName) {
    const user = await TodoConnector.createUser(userName)
    store.dispatch(createUser(user))
  }

  async deleteUser() {
    const userId = this.getActiveUserId()

    if (!userId) {
      return
    }

    await TodoConnector.deleteUser(userId)
    store.dispatch(deleteUser(userId))
    this.selectFirstUser()
  }

  async selectFirstUser() {
    const userId = getActiveUserId()

    if (!userId) {
      return
    }

    const user = await TodoConnector.getUser(userId)
    store.dispatch(getUser(user))
  }

  getActiveUserId() {
    const { seletedUser } = store.getState()

    return seletedUser?._id
  }

  setEvent(target) {
    const { SELECT_USER, CREATE_USER, DELETE_USER } = UserListActions

    target.addEventListener(EVENT.CLICK, (event) => {
      const target = event.target
      const action = target.dataset.action
      switch (action) {
        case SELECT_USER:
          const userId = target.dataset.user
          this.selectUser(userId)
          break

        case CREATE_USER:
          const userName = prompt('추가하고 싶은 이름을 입력해주세요')

          if (!userName) {
            break
          }

          if (userName.length < 2) {
            alert('사용자 이름은 2글자 이상이어야 합니다.')
            break
          }

          this.createUser(userName)
          break

        case DELETE_USER:
          this.deleteUser()
          break
      }

      event.stopImmediatePropagation()
    })
  }

  template() {
    const { users, seletedUser } = store.getState()

    return `
        <div id='user-list'>
            ${
              users &&
              users.map((user) =>
                UserListItem(user, user._id === seletedUser._id)
              )
            }
            <button class='ripple user-create-button' data-action='${
              UserListActions.CREATE_USER
            }'>
            + 유저 생성
            </button>
            <button class='ripple user-delete-button' data-action='${
              UserListActions.DELETE_USER
            }'>
            삭제 -
            </button>
        </div>
    `
  }
}
