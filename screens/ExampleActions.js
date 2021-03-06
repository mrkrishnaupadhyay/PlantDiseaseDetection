/**
 * Created by tino on 1/15/18.
 */
import moment from "moment";
import firebase from "react-native-firebase";



export function getComments(sampleComments) {
  let itemNum = 0
  let c = []
    if(sampleComments.constructor===Array){
        c = [...sampleComments]
      if(c.length<3){
        itemNum = c.length
      }
      else
        itemNum = 3

    }else{
      let keys = Object.keys(sampleComments).sort()
      for (let i = 0;i<keys.length;i++){
        c.push(sampleComments[keys[i]])
      }
    itemNum = c.length
    }
  return c.splice(c.length-itemNum);
}

export function paginateComments(sampleComments,
  comments,
  from_commentId,
  direction,
  parent_commentId
) {
  const c = [...sampleComments];
  if (!parent_commentId) {
    const lastIndex = sampleComments.findIndex(
      c => c.commentId == from_commentId
    );
    if (direction == "up") {
      comments = comments.concat(c.splice(lastIndex + 1, 5));
    } else {
      const start = lastIndex - 6 > 1 ? lastIndex - 6 : 0;

      const part = c.slice(start, lastIndex);
      console.log(start, lastIndex);
      console.log(part)
      comments = [...part, ...comments];
    }
  } else {
    const parentLastIndexDB = sampleComments.findIndex(
      c => c.commentId == parent_commentId
    );
    const children = c[parentLastIndexDB].children;
    const target = children.findIndex(c => c.commentId == from_commentId);
    const existingIndex = comments.findIndex(
      c => c.commentId == parent_commentId
    );

    if (direction == "up") {
      const append = children.slice(target + 1, 5);
      comments[existingIndex].children.concat(append);
    } else {
      const start = target - 6 >= 0 ? target : 0;
      const prepend = children.slice(start - 6, target);
      comments[existingIndex].children = [
        ...prepend,
        ...comments[existingIndex].children
      ];
    }
  }
  return comments;
}

export function like(comments, cmnt) {
  if (!cmnt.parentId) {
    // add result to comments
    if (comments) {
      comments.find(c => {
        if (c.commentId === cmnt.commentId) {
          c.liked = !c.liked;
          return true;
        }
      });
    }
  } else {
    comments.find(c => {
      if (c.children) {
        let isItFound = false;
        c.children.find(child => {
          if (child.commentId === cmnt.commentId) {
            child.liked = !child.liked;
            isItFound = true;
          }
        });
        return isItFound;
      }
    });
  }
  return comments;
}

export function edit(comments, cmnt, text) {
  if (!cmnt.parentId) {
    // add result to comments
    if (comments) {
      comments.find(c => {
        if (c.commentId === cmnt.commentId) {
          c.body = text;
          return true;
        }
      });
    }
  } else {
    comments.find(c => {
      if (c.children) {
        let isItFound = false;
        c.children.find(child => {
          if (child.commentId === cmnt.commentId) {
            child.body = text;
            isItFound = true;
          }
        });
        return isItFound;
      }
    });
  }
  return comments;
}

export function deleteComment(comments, cmnt) {
  if (!cmnt.parentId) {
    // add result to comments
    if (comments) {
      const index = comments.findIndex(c => c.commentId === cmnt.commentId);
      comments.splice(index, 1);
    }
  } else {
    comments.find(c => {
      if (c.children) {
        let isItFound = false;
        const index = c.children.findIndex(child => {
          if (child.commentId === cmnt.commentId) {
            isItFound = true;
          }
        });

        if (index) {
          c.children.splice(index, 1);
        }
        return isItFound;
      }
    });
  }
  return comments;
}
function updateReply(item){
  //update upVotes
  let writeRef = firebase.database().ref('comments/'+item.parentId)
    writeRef.child('children')
        .push(item)

}
export function save(sampleComments,comments, text, parentCommentId, date, user, postid) {
  // find last comment id
  let lastCommentId = -2;
  sampleComments.forEach(c => {
    if (c.commentId > lastCommentId) {
      lastCommentId = c.commentId;
    }
    if (c.children) {

      c.children.forEach(c2 => {
        if (c2.commentId > lastCommentId) {
          lastCommentId = c2.commentId;
        }
      });
    }
  });

  const com = {
    parentId: null,
    created_at: date,
    updated_at: date,
    liked: false,
    reported: false,
    body: text,
    name: user.firstname+' '+user.lastname,
    userProfilePic: user.profile_picture,
    userid: user.id,
    postid: postid
  };

  if (!parentCommentId) {

    //comments.push(com);

    let writef = firebase.database().ref('comments/').push()
    com.commentId = writef.key
    writef.set(com).then(function (snapshot) {
      console.log(snapshot)
    });
    let writeRef=firebase.database().ref('posts/'+postid)
    writeRef.once("value",(snapshot) => {
      let updates = {};
      updates["comments"] = snapshot._value.comments+1;
      writeRef.update(updates);
    } )


  } else {
    comments.find(c => {
      if (c.commentId === parentCommentId) {
        com.parentId = c.commentId;

        if (c.children) {
          c.childrenCount = c.childrenCount * 1 + 1;
          c.children.push(com);
          updateReply(com)


        } else {
          c.childrenCount = 1;

          c.children = [];
          c.children.push(com);
          updateReply(com)
        }
        return true;
      }
    }, this);
  }

  return comments;
}

export function report(comments, cmnt) {
  if (!cmnt.parentId) {
    // add result to comments

    comments.find(c => {
      if (c.commentId === cmnt.commentId) {
        c.reported = true;
        return true;
      }
    });
  } else {
    comments.find(c => {
      if (c.children) {
        let isItFound = false;
        c.children.find(child => {
          if (child.commentId === cmnt.commentId) {
            child.reported = true;
            isItFound = true;
          }
        });
        return isItFound;
      }
    });
  }
  return comments;
}
